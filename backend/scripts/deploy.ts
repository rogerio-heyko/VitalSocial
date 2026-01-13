import { ethers } from "hardhat";

async function main() {
    const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // Polygon Mainnet USDT

    console.log("Deploying DonationSplitter...");

    const DonationSplitter = await ethers.getContractFactory("VitalSocialSplitter");
    const splitter = await DonationSplitter.deploy(USDT_ADDRESS);

    await splitter.waitForDeployment();

    console.log(`DonationSplitter deployed to ${splitter.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
