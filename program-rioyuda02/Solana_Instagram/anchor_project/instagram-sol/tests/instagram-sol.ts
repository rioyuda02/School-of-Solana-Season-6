import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { InstagramSol } from "../target/types/instagram_sol";
import { assert } from "chai";

describe("instagram-sol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const user1 = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();
  const userForLongUsername = anchor.web3.Keypair.generate();

  const program = anchor.workspace.InstagramSol as Program<InstagramSol>;

// happy test 
  it("Is initialized!", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("transaction signature", tx);
  });

  before(async () => {
    const signature1 = await provider.connection.requestAirdrop(
      user1.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature1);
    
    const signature2 = await provider.connection.requestAirdrop(
      user2.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature2);

    const signature3 = await provider.connection.requestAirdrop(
      userForLongUsername.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature3);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), user1.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeUser("testuser1")
      .accounts({
        userProfile: userProfilePda,
        authority: user1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc();
  });

  it("can create and delete post", async () => {
    try {
      const contentUri = "https://example.com/image.jpg";
      const description = "My first post!";
      
      const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), user1.publicKey.toBuffer()],
        program.programId
      );

      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      const postCount = userProfile.postCount;
      
      const [postPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("post"),
          user1.publicKey.toBuffer(),
          new anchor.BN(postCount).toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );

      await program.methods
        .createPost(contentUri, description)
        .accounts({
          post: postPda,
          userProfile: userProfilePda,
          authority: user1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      const post = await program.account.post.fetch(postPda);
      assert.equal(post.contentUri, contentUri);
      assert.equal(post.description, description);
      assert.equal(post.likes.toString(), "0");

      // Test delete post
      await program.methods
        .deletePost()
        .accounts({
          post: postPda,
          userProfile: userProfilePda,
          authority: user1.publicKey,
        })
        .signers([user1])
        .rpc();

      // Verify post is deleted
      try {
        await program.account.post.fetch(postPda);
        assert.fail("Expected post to be deleted");
      } catch (err) {
        assert.ok(err.toString().includes("Account does not exist"));
      }
    } catch (error) {
      console.log("Post operation error:", error);
      throw error;
    }
  });

  it("can like and unlike post", async () => {
    try {
      // Create a post first
      const contentUri = "https://example.com/image2.jpg";
      const description = "Post for like test";
      
      const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), user1.publicKey.toBuffer()],
        program.programId
      );

      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      
      const [postPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("post"),
          user1.publicKey.toBuffer(),
          new anchor.BN(userProfile.postCount).toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );

      await program.methods
        .createPost(contentUri, description)
        .accounts({
          post: postPda,
          userProfile: userProfilePda,
          authority: user1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      // Like the post
      const [likePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("like"),
          postPda.toBuffer(),
          user2.publicKey.toBuffer()
        ],
        program.programId
      );

      await program.methods
        .likePost()
        .accounts({
          likeAccount: likePda,
          post: postPda,
          authority: user2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      let post = await program.account.post.fetch(postPda);
      assert.equal(post.likes.toString(), "1");

      // Unlike the post
      await program.methods
        .unlikePost()
        .accounts({
          likeAccount: likePda,
          post: postPda,
          authority: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      post = await program.account.post.fetch(postPda);
      assert.equal(post.likes.toString(), "0");

    } catch (error) {
      console.log("Like/Unlike operation error:", error);
      throw error;
    }
  });

// unhappy test
  it("fails with too long username", async () => {
    try {
      const longUsername = "a".repeat(200);
      
      const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), userForLongUsername.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeUser(longUsername)
        .accounts({
          userProfile: userProfilePda,
          authority: userForLongUsername.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userForLongUsername])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (err: any) {
      const errorString = err.toString();
      const errorLogs = err.logs ?? [];
      
      const isSerializationError = 
        errorString.includes("0xbbc") || 
        errorString.includes("3004") ||  
        errorLogs.some(log => log.includes("AccountDidNotSerialize"));

      if (isSerializationError) {
        assert.ok(true, "Got expected serialization error due to long username");
        return;
      }

      console.log("Unexpected error:", err);
      throw err;
    }
  });

  it("fails with too long content URI", async () => {
    try {
      const longContentUri = "h".repeat(256);
      const description = "Test post";
      
      const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user-profile"), user1.publicKey.toBuffer()],
        program.programId
      );

      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      
      const [postPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("post"),
          user1.publicKey.toBuffer(),
          new anchor.BN(userProfile.postCount).toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );

      const tx = await program.methods
        .createPost(longContentUri, description)
        .accounts({
          post: postPda,
          userProfile: userProfilePda,
          authority: user1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .transaction();

      const txHash = await provider.sendAndConfirm(tx, [user1]);
      assert.fail("Expected transaction to fail");
    } catch (err: any) {
      console.log("Content URI validation error:", err);
      
      const errorString = err.toString();
      if (!errorString.includes("custom program error: 0x1771")) {
        throw new Error(`Unexpected error: ${errorString}`);
      }
    }
  });
});