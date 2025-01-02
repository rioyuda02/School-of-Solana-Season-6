
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react'
import { InstagramSol } from '@/anchor/types/instagram_sol'
import idl from '@/anchor/idl/instagram_sol.json'

const ProgramContext = createContext<{
  program: Program<InstagramSol> | null;
  initialized: boolean;
}>({
  program: null,
  initialized: false,
});

export function ProgramProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program<InstagramSol> | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program(idl as InstagramSol, provider);
      setProgram(program);
      setInitialized(true);
    } 
  }, [connection, wallet]);

  return (
    <ProgramContext.Provider value={{ program, initialized }}>
      {children}
    </ProgramContext.Provider>
  );
}

export const useProgram = () => useContext(ProgramContext);