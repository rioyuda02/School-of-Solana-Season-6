'use client'

import { useWallet } from "@solana/wallet-adapter-react"
import { CreateProfile } from "@/app/components/CreateProfile"
import { CreatePost } from "@/app/components/CreatePost"
import { Card, CardContent } from "@/components/ui/card"
import { useProgram } from "@/app/contexts/ProgramContext"
import { useState, useEffect } from "react"
import { web3 } from "@coral-xyz/anchor"
import dynamic from "next/dynamic"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"


const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);


export default function Home() {
  const { publicKey, wallet} = useWallet();
  const { program } = useProgram();
  const [userProfile, setUserProfile] = useState<string|null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();


  useEffect(() => {

    const handle_connection = async () => {
        if (!window.solana) {
          toast({
            title: "Solana Wallet not Detected",
            description: "Install Phantom Wallet or others",
            variant: "destructive",
            action: (
              <ToastAction altText="try connect manual!">next</ToastAction>
            ),
          });
        }
      
      if(!publicKey && !wallet){
        toast({
          title: "Wallet Disonnected",
          description: "Successfully..",
          variant: "warning",
          action: (
            <ToastAction altText="Wallet Disconnected..">next</ToastAction>
          ),
        });
      }

      if(publicKey){
          toast({
            title: "Wallet Connected",
            description: "Successfully..",
            variant: "success",
            action: (
              <ToastAction altText="Wallet Connected..">next</ToastAction>
            ),
          });
        }
    } 

    const fetchUserProfile = async () => {
      if (!program || !publicKey) return;

      try {
        const [profilePda] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from("user-profile"), publicKey.toBuffer()],
          program.programId
        );

        const profile = (await program.account.userProfile.fetch(
          profilePda
        ));
        setUserProfile(profile.username);
      } catch {
        setError(error);
      }
    };

    handle_connection();
    fetchUserProfile();
  }, [userProfile, program, error, wallet]);

  return (
    <>
      <div className="flex w-full h-auto">
        <main className="container mx-auto p-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold">SOL @Instagram by rioyuda02</h1>
            <WalletMultiButton />
          </div>

          {!publicKey && (
            <Alert className="flex justify-center">
              <AlertDescription>Create Your Post</AlertDescription>
            </Alert>
          )}

          {!userProfile && publicKey && (
            <Card className="mb-8">
              <div>
                {error && (
                  <Alert>
                    <AlertDescription className="text-orange-400">
                      {'Connect Your Wallet!'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Create Profile</h2>
                <CreateProfile />
              </CardContent>
            </Card>
          )}

          {publicKey && userProfile &&(
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Create Post</h2>
                <CreatePost />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}
