mod tests;

#[allow(unused_doc_comments)]
pub mod questions {
    /// -------------------------------------------------------------------------------------------
    /// Proof of History
    /// -------------------------------------------------------------------------------------------
    pub fn question_1() -> char {
        /// What mechanism does Solana use to synchronize local virtual clocks on all nodes?
        ///
        /// a) Turbine
        /// b) Proof-of-Stake
        /// c) Proof-of-History (PoH)
        /// d) Sealevel
        'c'
    }
    pub fn question_2() -> char {
        /// Which statement best describes the nature of PoH in relation to its production and verification?
        ///
        /// a) PoH is easy to produce but difficult to verify.
        /// b) PoH is difficult to produce and difficult to verify.
        /// c) PoH is easy to produce and easy to verify.
        /// d) PoH is difficult to produce but easy to verify.
        'd'
    }
    pub fn question_3() -> char {
        /// Which statement about PoH is correct?
        ///
        /// a) PoH is a consensus mechanism.
        /// b) PoH replaces communication with local computation.
        /// c) PoH is a Sybil resistance mechanism.
        /// d) The evaluation phase of PoH is very fast because it utilizes thousands of GPU cores.
        'b'
    }
    /// -------------------------------------------------------------------------------------------
    /// Tower BFT
    /// -------------------------------------------------------------------------------------------
    pub fn question_4() -> char {
        /// What happens if the current leader appears to be malicious or faulty?
        ///
        /// a) Another node attempts to take his place by initiating an election process.
        /// b) A new consensus round starts.
        /// c) The protocol halts until the leader returns.
        /// d) PoH counters are reset.
        'a'
    }
    /// -------------------------------------------------------------------------------------------
    /// Turbine
    /// -------------------------------------------------------------------------------------------
    pub fn question_5() -> char {
        /// What does Turbine aim to reduce by utilizing a smart block propagation protocol?
        ///
        /// a) Time needed for transaction validation.
        /// b) Time needed for block propagation.
        /// c) Time needed for consensus voting.
        /// d) Time needed for PoH validation.
        'b'
    }
    pub fn question_6() -> char {
        /// How are nodes in the network organized in the Turbine protocol?
        ///
        /// a) Into chains.
        /// b) Into shreds.
        /// c) Into neighborhoods.
        /// d) Into clusters.
        'c'
    }
    pub fn question_7() -> char {
        /// Which of the following describes how propagation priority is determined in Turbine?
        ///
        /// a) Node`s uptime and reliability.
        /// b) Node`s proximity to the current leader.
        /// c) Node`s computational power.
        /// d) Stake-weighted selection algorithm.
        'd'
    }
    /// -------------------------------------------------------------------------------------------
    /// Gulf Stream
    /// -------------------------------------------------------------------------------------------
    pub fn question_8() -> char {
        /// What does Gulf Stream serve as in Solana?
        ///
        /// a) A mempool-less solution for forwarding and storing transactions before processing.
        /// b) A memory pool solution for storing processed transactions.
        /// c) A protocol for communication overhead reduction.
        /// d) A protocol to speed up consensus decision.
        'a'
    }
    pub fn question_9() -> char {
        /// What is the primary role of the mempool in traditional blockchains?
        ///
        /// a) To process transactions instantaneously.
        /// b) To reserve memory for block processing.
        /// c) To store transactions that have been added to the blockchain.
        /// d) To store transactions that are being broadcasted but have not yet been processed.
        'd'
    }
    /// -------------------------------------------------------------------------------------------
    /// Sealevel
    /// -------------------------------------------------------------------------------------------
    pub fn question_10() -> char {
        /// Why can Solana execute transactions in parallel?
        ///
        /// a) It uses Ethereum Virtual Machine (EVM).
        /// b) It describes all the states required to read and write to.
        /// c) It uses proof of stake consensus.
        /// d) It was designed that way from inception.
        'b'
    }
    /// -------------------------------------------------------------------------------------------
    /// Pipelining
    /// -------------------------------------------------------------------------------------------
    pub fn question_11() -> char {
        /// Why did the Solana team develop the Transaction Processing Unit (TPU)?
        ///
        /// a) To ensure faster consensus among nodes.
        /// b) To optimize block sharing.
        /// c) To validate and execute transactions quickly before receiving another block.
        /// d) To integrate with other blockchain networks.
        'c'
    }

    pub fn question_12() -> char {
        /// Which of the following is NOT a pipeline stage of the TPU as mentioned?
        ///
        /// a) Data fetch in kernel space via network card (I/O).
        /// b) Encryption of data using the GPU.
        /// c) Change of the state using CPU (banking).
        /// d) Write to the disk in kernel space and send out via network card (I/O).
        'b'
    }
    /// -------------------------------------------------------------------------------------------
    /// Cloudbreak
    /// -------------------------------------------------------------------------------------------
    pub fn question_13() -> char {
        /// What becomes a bottleneck after achieving fast computation in blockchain systems?
        ///
        /// a) Memory.
        /// b) Processor speed.
        /// c) Network connectivity.
        /// d) GPU acceleration.
        'a'
    }
    pub fn question_14() -> char {
        /// How does Cloudbreak handle data storage?
        ///
        /// a) It uses cloud-based storage systems.
        /// b) It makes use of memory-mapped files.
        /// c) It prioritizes CPU storage over disk storage.
        /// d) It employs traditional databases for optimized reading and writing.
        'b'
    }
    /// -------------------------------------------------------------------------------------------
    /// Archivers
    /// -------------------------------------------------------------------------------------------
    pub fn question_15() -> char {
        /// How is data integrity ensured among the specialized network nodes?
        ///
        /// a) By frequently erasing older data.
        /// b) By centralizing the storage into a single hub.
        /// c) By creating multiple copies of the Solana blockchain.
        /// d) By splitting into small pieces and replicating the data multiple times.
        'd'
    }
}

fn main() {}
