const hre = require('hardhat')


// Returns the Ethere balance of a given address
async function getBalance(address){
  const balanceBigInt = await hre.ethers.provider.getBalance(address)
  return hre.ethers.formatEther(balanceBigInt)
}


// Logs the Ether balances for a list of addresses
async function printBalances(addresses){
  let idx = 0
  for(const address of addresses){
    console.log(`Address ${idx} balance: `, await getBalance(address))
    idx++
  }
}

// Logs the memos stored on-chain from coffee purchases
async function printMemos(memos){
  for (const memo of memos) {
    const timestamp = memo.timestamp
    const tipper = memo.name
    const tipperAddress = memo.from
    const message = memo.message
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`)
  }
}


// Withdraw funds

// Check balance after withdraw

// Read all the memos left for the owner
async function main(){

  // Get examples accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();


  // Get the contracts to deploy & deploy
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  console.log("BuyMeACoffee deployed to: ", buyMeACoffee.target);


  // CHeck balances before the coffee purchase
  const addresses = [owner.address, tipper.address, buyMeACoffee.target]
  console.log("== start ==")

  await printBalances(addresses)

  // Buy the owner a few coffees

  const tip = {value: hre.ethers.parseEther("1")}
  await buyMeACoffee.connect(tipper).buyCoffee("Igor", "You're the best!", tip)
  await buyMeACoffee.connect(tipper2).buyCoffee("Adelino", "Amazing student!", tip)
  await buyMeACoffee.connect(tipper3).buyCoffee("Araújo", "Some knowledge!", tip)

  // Check balances after coffee purchase
  console.log("== bought coffeee ==")
  await printBalances(addresses)

  //Withdraw funds

  await buyMeACoffee.connect(owner).withdrawTips()

  // Check balance after withdraw
  console.log("== withdraw ==")
  await printBalances(addresses)


  // Memos
  console.log("== memos ==")
  const memos = await buyMeACoffee.getMemos()
  printMemos(memos)
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error)
  process.exit(1)
})