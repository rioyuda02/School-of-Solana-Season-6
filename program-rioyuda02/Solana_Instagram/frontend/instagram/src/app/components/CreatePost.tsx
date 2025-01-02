import React, { useCallback, useEffect, useState } from "react";
import { useProgram } from "@/app/contexts/ProgramContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Link, Heart, Clock, User, Trash2} from "lucide-react";


interface Post {
  contentUri: string;
  description: string;
  likes: number;
  createdAt: number;
  authority: string;
  postIndex: number;
  liked: boolean;
}

export function CreatePost() {
  const [contentUri, setContentUri] = useState("");
  const [description, setDescription] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deletePostIndex, setDeletePostIndex] = useState<number | null>(null);
  const { program } = useProgram();
  const { publicKey } = useWallet();

  const checkUserProfile = useCallback(async () => {
    if (!program || !publicKey) return false;
  
    try {
      const [profilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), publicKey.toBuffer()],
        program.programId
      );
  
      const userProfile = await program.account.userProfile.fetchNullable(
        profilePda
      );
      const isInit = !!userProfile;
      setIsInitialized(isInit);
      return isInit;
    } catch (error) {
      console.error("Error checking user profile:", error);
      setError("Error checking user profile");
      return false;
    }
  }, [program, publicKey, setIsInitialized, setError]);

  const initializeUserProfile = async () => {
    if (!program || !publicKey) return;
  
    try {
      const [profilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), publicKey.toBuffer()],
        program.programId
      );
      // @ts-nocheck
      await program.methods
        .initializeUser('')
        .accountsPartial({
          userProfile: profilePda,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setIsInitialized(true);
      setError("User profile initialized successfully!");
      await fetchPosts(); // Refresh posts after initialization
    } catch (error) {
      console.error("Error initializing user profile:", error);
      setError("Failed to initialize user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!program || !publicKey) {
      setError("Wallet not connected");
      return;
    }

    if (!contentUri.trim() || !description.trim()) {
      setError("Please fill in both Content URI and Description");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [profilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), publicKey.toBuffer()],
        program.programId
      );

      const userProfile = await program.account.userProfile.fetchNullable(
        profilePda
      );
      if (!userProfile) {
        setError("User profile not found. Please initialize first.");
        return;
      }

      const postCountBuf = Buffer.alloc(8);
      postCountBuf.writeBigUInt64LE(BigInt(userProfile.postCount.toString()));

      const [postPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("post"), publicKey.toBuffer(), postCountBuf],
        program.programId
      );

      const tx = await program.methods
      .createPost(contentUri, description)
      .accountsPartial({
        post: postPda,
        userProfile: profilePda,
        authority: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

      console.log("Create post transaction signature:", tx);

      setContentUri("");
      setDescription("");
      setError("Post created successfully!");
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async (postPda: web3.PublicKey) => {
    if (!program || !publicKey) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [likeAccountPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("like"), postPda.toBuffer(), publicKey.toBuffer()],
        program.programId
      );

      // Try to fetch the like account to determine if it exists
      let isLiked = false;
      try {
        await program.account.like.fetch(likeAccountPda);
        isLiked = true;
      } catch {
        isLiked = false;
      }

      if (!isLiked) {
        // Like the post
        const tx = await program.methods
          .likePost()
          .accountsPartial({
            likeAccount: likeAccountPda,
            post: postPda,
            authority: publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
        console.log("Like transaction signature:", tx);
        setError("Post liked successfully!");
      } else {
        // Unlike the post
        const tx = await program.methods
          .unlikePost()
          .accountsPartial({
            likeAccount: likeAccountPda,
            post: postPda,
            authority: publicKey,
          })
          .rpc();
        console.log("Unlike transaction signature:", tx);
        setError("Post unliked successfully!");
      }

      await fetchPosts();
    } catch (error) {
      console.error("Error handling like/unlike:", error);
      setError("Failed to like/unlike post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postIndex: number) => {
    if (!program || !publicKey) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const indexBuf = Buffer.alloc(8);
      indexBuf.writeBigUInt64LE(BigInt(postIndex));

      const [postPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("post"), publicKey.toBuffer(), indexBuf],
        program.programId
      );

      const [profilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .deletePost()
        .accountsPartial({
          post: postPda,
          userProfile: profilePda,
          authority: publicKey,
        })
        .rpc();

      console.log("Delete post transaction signature:", tx);
      setError("Post deleted successfully!");
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      if (error + "Account not found"){
        setError("Post already deleted or not found");
      } else {
        setError("Failed to delete post");
      }
    } finally {
      setIsLoading(false);
      setDeletePostIndex(null);
    }
  };

  const fetchPosts = useCallback(async () => {
    if (!program || !publicKey) return;
  
    try {
      const [profilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), publicKey.toBuffer()],
        program.programId
      );
  
      const userProfile = await program.account.userProfile.fetchNullable(
        profilePda
      );
  
      if (!userProfile) {
        console.warn("User profile not found. Please initialize it first.");
        return;
      }
  
      const fetchedPosts: Post[] = [];
      for (let i = 0; i < userProfile.postCount; i++) {
        try {
          const indexBuf = Buffer.alloc(8);
          indexBuf.writeBigUInt64LE(BigInt(i));
  
          const [postPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("post"), publicKey.toBuffer(), indexBuf],
            program.programId
          );
  
          const post = await program.account.post.fetchNullable(postPda);
  
          if (post) {
            // Check if the current user has liked this post
            const [likeAccountPda] = web3.PublicKey.findProgramAddressSync(
              [Buffer.from("like"), postPda.toBuffer(), publicKey.toBuffer()],
              program.programId
            );
  
            let liked = false;
            try {
              await program.account.like.fetch(likeAccountPda);
              liked = true;
            } catch {
              liked = false;
            }
  
            fetchedPosts.push({
              contentUri: post.contentUri,
              description: post.description,
              likes: post.likes.toNumber(),
              createdAt: post.createdAt.toNumber(),
              authority: post.authority.toBase58(),
              postIndex: i,
              liked: liked,
            });
          }
        } catch (postError) {
          console.error(`Error fetching post at index ${i}:`, postError);
        }
      }
  
      // Sort posts by creation time (newest first)
      fetchedPosts.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts");
    }
  }, [program, publicKey, setPosts, setError]);

  const confirmDelete = async (postIndex: number) => {
    setDeletePostIndex(postIndex);
  };

  const handleDeleteConfirmed = async () => {
    if (deletePostIndex === null) return;
    await handleDeletePost(deletePostIndex);
  };

  // Initialize user profile and fetch posts
  useEffect(() => {
    if (program && publicKey) {
      checkUserProfile().then((isInit) => {
        if (isInit) {
          fetchPosts();
        }
      });
    }
  }, [fetchPosts, checkUserProfile, program, publicKey]);

  const renderDeleteDialog = () => (
    <Dialog
      open={deletePostIndex !== null}
      onOpenChange={() => setDeletePostIndex(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <div className="mt-4">
            <p className="text-gray-600">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeletePostIndex(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirmed}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isLoading ? "Deleting..." : "Delete Post"}
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="flex w-full h-auto">
        <div className="w-full h-auto max-w-3xl mx-auto p-4 justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">SOL Instagram</h1>

            <div className="bg-purple-600 text-white p-4 rounded-lg mb-8 flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span className="text-lg">
                {publicKey
                  ? `${publicKey.toString().slice(0, 4)}...${publicKey
                      .toString()
                      .slice(-4)}`
                  : "Connect Wallet"}
              </span>
            </div>
          </div>

          {error && (
            <Alert
              className={`mb-4 ${
                error.includes("successfully")
                  ? "bg-green-500 text-green-100"
                  : "bg-orange-500 text-orange-100"
              }`}
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isInitialized && (
            <div className="text-center mb-8">
              <Button
                onClick={initializeUserProfile}
                disabled={isLoading}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Initializing..." : "Initialize User Profile"}
              </Button>
            </div>
          )}

          {isInitialized && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Create Post</h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Link className="w-5 h-5 text-purple-600" />
                  <Input
                    placeholder="Content URI"
                    value={contentUri}
                    onChange={(e) => setContentUri(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Camera className="w-5 h-5 text-purple-600 mt-2" />
                  <Textarea
                    placeholder="What's on your mind?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 border rounded min-h-[100px]"
                  />
                </div>

                <div className="text-right">
                  <Button
                    onClick={handleCreatePost}
                    disabled={
                      isLoading || !contentUri.trim() || !description.trim()
                    }
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? "Creating..." : "Share Post"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>

            {posts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No posts yet. Be the first to share!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {publicKey &&
                  program &&
                  posts.map((post, index) => {
                    const indexBuf = Buffer.alloc(8);
                    indexBuf.writeBigUInt64LE(BigInt(post.postIndex));
                    const [postPda] = web3.PublicKey.findProgramAddressSync(
                      [Buffer.from("post"), publicKey.toBuffer(), indexBuf],
                      program.programId
                    );

                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">
                                {post.authority.slice(0, 4)}...
                                {post.authority.slice(-4)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {post.authority === publicKey?.toBase58()
                                  ? "(You)"
                                  : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(
                                post.createdAt * 1000
                              ).toLocaleDateString()}{" "}
                              {new Date(
                                post.createdAt * 1000
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4 space-y-3">
                          {post.contentUri && (
                            <div className="mb-4">
                              <a
                                href={post.contentUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                              >
                                <Link className="w-4 h-4" />
                                <span>View Content</span>
                              </a>
                            </div>
                          )}
                          <p className="text-gray-800 border-l-4 border-purple-600 pl-4 py-2 bg-purple-50 rounded-r-lg">
                            {post.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4">
                            <Button
                              onClick={() => handleToggleLike(postPda)}
                              disabled={isLoading}
                              variant="ghost"
                              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${
                                post.liked
                                  ? "hover:bg-red-50"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <Heart
                                className="w-4 h-4"
                                fill={post.likes ? "red" : "none"}
                                stroke={post.likes ? "red" : "none"}
                                style={{
                                  transform: post.liked
                                    ? "scale(1.1)"
                                    : "scale(1)",
                                  transition: "transform 0.2s",
                                }}
                              />
                              <span
                                className={post.likes ? "text-red-600" : "none"}
                              >
                                {post.likes}{" "}
                                {post.likes === 1 ? "Like" : "Likes"}
                              </span>
                            </Button>
                          </div>

                          {post.authority === publicKey?.toBase58() && (
                            <Button
                              onClick={() => confirmDelete(post.postIndex)}
                              disabled={isLoading}
                              variant="ghost"
                              className="flex items-center space-x-2 px-4 py-2 text-purple-800 hover:bg-red-200 rounded-full transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
      {renderDeleteDialog()}
    </>
  );
}
