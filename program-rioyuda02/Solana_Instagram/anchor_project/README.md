# TODO

# Instagram-Sol

A decentralized social media program built on Solana that implements core Instagram-like features using Anchor framework.
this program has been deployed to `Devnet`:
`https://solscan.io/account/GztjNt5uJiR5kvNVjHnGzsaA8FHbDEeCRH5jB5vHkP7J?cluster=devnet`


## Features
- User profile creation
- Post creation and deletion
- Like/unlike posts
- Content validation for usernames and posts

## Prerequisites
- Rust
- Solana CLI tools
- Anchor Framework
- Node.js and npm

## Installation

1. Go to the directory:
```bash
cd anchor_project/instagram-sol
```

2. Install dependencies:
```bash
npm install
```

3. Build the program:
```bash
anchor build
```

## Testing in Local

1. Change setting in `Anchor.toml` from dev to local:
    - [programs.localnet] 
    - cluster = "Localnet" 

2. Run tests:
```bash
anchor test
```

## Program test
- happy
- unhappy

## Program Structure
- `lib.rs`: Main program logic and instruction handlers
- `tests/`: Contains integration tests
- `Anchor.toml`: Program configuration
- `programs/`: Contains the program's source code

## Account Structure
- `UserProfile`: Stores user information
- `Post`: Stores post content and metadata
- `Like`: Tracks post likes

## Error Handling
The program includes validation for:
- Username length
- Content URI length
- Description length