// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VitalSocialSplitter
 * @dev Splits incoming USDT donations: 95% to Project, 5% to VitalSocial App.
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract VitalSocialSplitter {
    address public constant APP_WALLET = 0x7d944f1e5323e5AC1798D3FA82a9Ab5EbDB58eFE; // 5%
    IERC20 public usdt;

    event DonationSplit(address indexed donor, address indexed project, uint256 totalAmount, uint256 projectAmount, uint256 feeAmount);

    constructor(address _usdtToken) {
        usdt = IERC20(_usdtToken);
    }

    function donate(address projectWallet, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        
        uint256 fee = (amount * 5) / 100;
        uint256 projectShare = amount - fee;

        // Transfer total from donor to this contract
        require(usdt.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Forward shares
        require(usdt.transfer(projectWallet, projectShare), "Project transfer failed");
        require(usdt.transfer(APP_WALLET, fee), "Fee transfer failed");

        emit DonationSplit(msg.sender, projectWallet, amount, projectShare, fee);
    }
}
