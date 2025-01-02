'use client';

import { useState } from 'react';
import { useProgram } from '@/app/contexts/ProgramContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@coral-xyz/anchor';
import { Check } from 'lucide-react';
import { WalletSignTransactionError } from '@solana/wallet-adapter-base';

export function CreateProfile() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const [error, setError] = useState<string>('');


  const handleCreateProfile = async () => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    setShowSuccessMessage(false);

    try {
      const [profilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('user-profile'), publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeUser(username)
        .accountsPartial({
          userProfile: profilePda,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      
      setShowSuccessMessage(true);
      setProfileCreated(true);
      setUsername('');
      
      setTimeout(()=>{
        window.location.reload();
      },2000)

      
    } catch (error) {
      if (error instanceof WalletSignTransactionError) {
        setError('Sign Error, Rejected!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showSuccessMessage && profileCreated &&(
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile created successfully! Loading post creation...
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Input
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
      />
      <Button 
        onClick={handleCreateProfile} 
        disabled={isLoading || !username.trim()}
      >
        {isLoading ? 'Creating...' : 'Create Profile'}
      </Button>   
    </div>
  );
}