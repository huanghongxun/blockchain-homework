pragma solidity ^0.4.24;
import "./Table.sol";

contract Transaction18 {

    struct Company {
        address addr; // 公司账号
        string name; // 企业名称
        bool bank; // 是否是金融机构，可以向公司颁发信用凭证
        bool gov; // 是否是政府机关，有权授权将账户标记为公司账户

        // 企业依据信用凭证产生的总欠款
        // 大于 0 表示该公司还可以签发应收账款，否则表示公司必须向债权方还款（支付应收账款）
        // 对于金融机构，表示能签发的最大信用额度

        // 获得的尚未返还的信用凭证总量
        int256 inBalance;
        // 签发的尚未收回的信用凭证总量
        int256 outBalance;
    }

    // 临时变量，提供给 findCompany 保存数据，由于傻逼 solidity 当前版本不支持返回接口体，只能这么写
    Company company;

    struct Receipt {
        address debtor;
        address debtee;
        int receiptId;
        int amount;
        int deadline;
        int valid; // 0 - 待审核，1 - 接受，2 - 不接受, 3 - 还款阶段
    }
    
    Receipt receipt;

    function concat(string _base, string _value) internal returns (string) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        string memory _tmpValue = new string(_baseBytes.length + _valueBytes.length);
        bytes memory _newValue = bytes(_tmpValue);

        uint i;
        uint j;

        for (i = 0; i <_baseBytes.length; i++) {
            _newValue[j++] = _baseBytes[i];
        }

        for (i = 0; i < _valueBytes.length; i++) {
            _newValue[j++] = _valueBytes[i];
        }

        return string(_newValue);
    }

    // 收据 id，每次创建由该公司的转出交易时加 1
    int nextReceiptId;

    // 央行账号
    // 1. 用于承认和撤销金融机构资格
    // 2. 用于承认政府和公司账号
    address adminAddr;

    // 数据库表版本号
    string suffix;

    // 公司注册事件
    event CompanyRegistration(address addr, string name);
    event BankRegistration(address addr, string name);
    event GovernmentRegistration(address addr, string name);

    // 信用凭证交易发起事件
    event TransactionBegin(address debtor, address debtee, int receiptId, int256 amount);
    // 信用凭证交易接受事件
    event TransactionEnd(address debtor, address debtee, int receiptId);

    // 信用凭证销毁事件
    event ReturnBegin(address debtor, address debtee, int receiptId, int amount);
    event ReturnEnd(address debtor, address debtee, int receiptId, int amount);

    function toString(address x) private constant returns (string) {
        bytes32 value = bytes32(uint256(x));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    constructor(address _adminAddr, string _suffix) {
        adminAddr = _adminAddr;
        suffix = _suffix;

        TableFactory tf = TableFactory(0x1001);
        tf.createTable(concat("t_company", suffix), "addr", "name,bank,gov,in_balance,out_balance");
        tf.createTable(concat("t_in_receipt", suffix), "debtee", "debtor,debtorName,debtee,debteeName,receiptId,amount,deadline,valid");
        tf.createTable(concat("t_out_receipt", suffix), "debtor", "debtor,debtorName,debtee,debteeName,receiptId,amount,deadline,valid");

        insertCompany(adminAddr, "Administrator", true, true, 10000000000000000000, 0);
    }

    function openTable(string tableName) private returns(Table) {
        TableFactory tf = TableFactory(0x1001);
        return tf.openTable(concat(tableName, suffix));
    }

    function insertReceipt(string tableName, string key, address debtor, address debtee, int receiptId, int amount, int deadline, int valid) private {
        Table t_receipt = openTable(tableName);
        Entry entry = t_receipt.newEntry();
        entry.set("debtor", toString(debtor));
        findCompany(debtor);
        entry.set("debtorName", company.name);
        entry.set("debtee", toString(debtee));
        findCompany(debtee);
        entry.set("debteeName", company.name);
        entry.set("receiptId", receiptId);
        entry.set("amount", amount);
        entry.set("deadline", deadline);
        entry.set("valid", valid);
        t_receipt.insert(key, entry);
    }

    function findReceipt(string tableName, string key, int receiptId) private {
        Table t_receipt = openTable(tableName);
        Condition cond = t_receipt.newCondition();
        cond.EQ("receiptId", receiptId);
        Entries entries = t_receipt.select(key, cond);
        require(entries.size() == 1, "receipt id not exists or unique");
        Entry entry = entries.get(0);
        receipt.debtee = entry.getAddress("debtee");
        receipt.debtor = entry.getAddress("debtor");
        receipt.receiptId = entry.getInt("receiptId");
        receipt.amount = entry.getInt("amount");
        receipt.deadline = entry.getInt("deadline");
        receipt.valid = entry.getInt("valid");
    }

    function updateReceiptInt(string tableName, string key, int receiptId, string fieldKey, int newValue, bool removeOnZero) private {
        Table t_receipt = openTable(tableName);
        Condition cond = t_receipt.newCondition();
        cond.EQ("receiptId", receiptId);
        if (removeOnZero && newValue <= 0) {
            t_receipt.remove(key, cond);
        } else {
            Entries entries = t_receipt.select(key, cond);
            require(entries.size() == 1, "receipt id not exists or unique");
            Entry entry = entries.get(0);
            entry.set(fieldKey, newValue);
            t_receipt.update(key, entry, cond);
        }
    }

    // 提供给央行增发信用
    function addBalance(int256 amount) public {
        require(msg.sender == adminAddr, "Only the Central Bank is allowed");
        int inBalance; int outBalance; (inBalance, outBalance) = findCompanyBalance(msg.sender); // 债务人
        inBalance += amount;
        updateCompanyBalance(msg.sender, inBalance, outBalance);
    }

    // 央行将指定账户设置为金融机构，信用额度
    function registerBank(address addr, string name) public {
        require(msg.sender == adminAddr, "Only the Central Bank is allowed to banks registration");
        insertCompany(addr, name, true, false, 0, 0);
        emit BankRegistration(addr, name);
    }

    // 政府账号调用本函数将账户注册为公司
    // 每个账号只能注册一次
    function registerCompany(address addr, string name) public {
        findCompany(msg.sender);
        require(company.gov, "Only governments are allowed to companies registration");
        insertCompany(addr, name, false, false, 0, 0);
        emit CompanyRegistration(addr, name);
    }

    // 政府账号调用本函数将账户注册为公司
    // 每个账号只能注册一次
    function registerGovernment(address addr, string name) public {
        require(msg.sender == adminAddr, "Only the Central Bank is allowed to governments registration");
        insertCompany(addr, name, false, true, 0, 0);
        emit GovernmentRegistration(addr, name);
    }

    function insertCompany(address addr, string name, bool bank, bool gov, int inBalance, int outBalance) private {
        Table t_company = openTable("t_company");
        Entries entries = t_company.select(toString(addr), t_company.newCondition());
        require(entries.size() == 0, "Company should not exist");
        Entry entry = t_company.newEntry();
        entry.set("name", name);
        entry.set("bank", bank ? int(1) : int(0));
        entry.set("gov", gov ? int(1) : int(0));
        entry.set("in_balance", inBalance);
        entry.set("out_balance", outBalance);
        t_company.insert(toString(addr), entry);
    }

    function findCompany(address addr) private {
        Table t_company = openTable("t_company");
        Entries entries = t_company.select(toString(addr), t_company.newCondition());
        require(entries.size() == 1, "Company should exist and be unique");
        Entry entry = entries.get(0);
        company.addr = addr;
        company.name = entry.getString("name");
        company.bank = entry.getInt("bank") == 1 ? true : false;
        company.gov = entry.getInt("gov") == 1 ? true : false;
        company.inBalance = entry.getInt("in_balance");
        company.outBalance = entry.getInt("out_balance");
    }

    function findCompanyBalance(address addr) private returns(int, int) {
        findCompany(addr);
        return (company.inBalance, company.outBalance);
    }

    function updateCompanyBalance(address addr, int inBalance, int outBalance) private {
        Table t_company = openTable("t_company");
        Entries entries = t_company.select(toString(addr), t_company.newCondition());
        require(entries.size() == 1, "Company should be unique");
        Entry entry = entries.get(0);
        entry.set("in_balance", inBalance);
        entry.set("out_balance", outBalance);
        t_company.update(toString(addr), entry, t_company.newCondition());
    }

    // 由第三方金融机构账户调用本函数，表示 debtor 公司向 debtee 公司转移信用凭证，
    // 或者 debtor 公司向 debtee 银行借款（将 debtor 的信用转移给银行表示融资）
    // 或者 debtor 银行向 debtee 公司提供信用凭证
    // debtor=msg.sender
    function transferCredit(address debtee, int256 amount, int deadline) public {
        int debtorIn; int debtorOut; (debtorIn, debtorOut) = findCompanyBalance(msg.sender); // 债务人
        int debteeIn; int debteeOut; (debteeIn, debteeOut) = findCompanyBalance(debtee); // 债权人
        require(debtorIn - debtorOut >= amount, "Debtor does not have enough balance");

        debtorOut += amount;
        debteeIn += amount;
        updateCompanyBalance(msg.sender, debtorIn, debtorOut);
        updateCompanyBalance(debtee, debteeIn, debteeOut);

        nextReceiptId++;

        insertReceipt("t_in_receipt", toString(debtee), msg.sender, debtee, nextReceiptId, amount, deadline, 0);
        insertReceipt("t_out_receipt", toString(msg.sender), msg.sender, debtee, nextReceiptId, amount, deadline, 0);

        emit TransactionBegin(msg.sender, debtee, nextReceiptId, amount);
    }

    // 由债权人调用，表示接受债务人转移的信用凭证
    // valid = 1 表示接受转移，valid = 2 表示拒绝转移
    function acceptTransferCredit(int receiptId, int valid) public {
        require(valid == 1 || valid == 2, "Only accepting or declining are allowed");
        findReceipt("t_in_receipt", toString(msg.sender), receiptId);
        require(receipt.valid == 0, "Receipt to be accepted should be pending");

        updateReceiptInt("t_in_receipt", toString(receipt.debtee), receiptId, "valid", valid, false);
        updateReceiptInt("t_out_receipt", toString(receipt.debtor), receiptId, "valid", valid, false);

        emit TransactionEnd(receipt.debtor, receipt.debtee, receiptId);
    }

    // 由债权人调用，表示返还信用凭证
    // debtee 公司向 debtor 公司返还信用凭证（表示 debtor 公司向 debtee 公司支付货款）
    // debtee 公司向 debtor 银行返还信用凭证（表示期限前撤销信用凭证）
    // debtee 银行向 debtor 公司返还信用凭证（公司完成融资还款）
    function returnCredit(int receiptId, int amount) public {
        findReceipt("t_in_receipt", toString(msg.sender), receiptId);
        int debtorIn; int debtorOut; (debtorIn, debtorOut) = findCompanyBalance(receipt.debtor); // 债务人
        int debteeIn; int debteeOut; (debteeIn, debteeOut) = findCompanyBalance(receipt.debtee); // 债权人

        require(amount > 0, "You must return credits non negative");
        require(receipt.amount >= amount, "Cannot return credit more than amount transfered at first");
        require(receipt.valid == 1, "Receipt should be already accepted");

        updateReceiptInt("t_in_receipt", toString(receipt.debtee), receiptId, "valid", 3, false);
        updateReceiptInt("t_out_receipt", toString(receipt.debtor), receiptId, "valid", 3, false);

        // 只更新一方的账款，用两侧账款差表示还款总额
        updateReceiptInt("t_out_receipt", toString(receipt.debtor), receiptId, "amount", receipt.amount - amount, false);

        emit ReturnBegin(receipt.debtor, receipt.debtee, receiptId, amount);
    }

    // 由债务人调用，表示接受债权人返还的信用凭证
    function acceptReturnCredit(int receiptId, int valid) public {
        require(valid == 1 || valid == 2, "Only accepting or declining are allowed");

        findReceipt("t_out_receipt", toString(msg.sender), receiptId);
        Receipt memory outReceipt = receipt;
        findReceipt("t_in_receipt", toString(receipt.debtee), receiptId);
        Receipt memory inReceipt = receipt;
        require(inReceipt.valid == outReceipt.valid, "Receipt states are nonconsistent");
        require(inReceipt.valid == 3, "Only Receipts pending for returning are allowed to accept");
        require(outReceipt.amount < inReceipt.amount, "Receipts states are nonconsistent");

        int debtorIn; int debtorOut; (debtorIn, debtorOut) = findCompanyBalance(receipt.debtor); // 债务人
        int debteeIn; int debteeOut; (debteeIn, debteeOut) = findCompanyBalance(receipt.debtee); // 债权人
        int amount = inReceipt.amount - outReceipt.amount;

        if (valid == 1) { // 接受返还信用凭证
            // 同步两侧账款
            updateReceiptInt("t_in_receipt", toString(receipt.debtee), receiptId, "amount", outReceipt.amount, true);
            updateReceiptInt("t_out_receipt", toString(receipt.debtor), receiptId, "amount", outReceipt.amount, true);
            
            debtorOut -= amount;
            debteeIn -= amount;
            updateCompanyBalance(receipt.debtor, debtorIn, debtorOut);
            updateCompanyBalance(receipt.debtee, debteeIn, debteeOut);
        } else { // 拒绝返还信用凭证，恢复账款
            // 恢复单侧账款
            updateReceiptInt("t_out_receipt", toString(receipt.debtor), receiptId, "amount", inReceipt.amount, true);
        }

        // 恢复账款到接受状态
        updateReceiptInt("t_in_receipt", toString(receipt.debtee), receiptId, "valid", 1, false);
        updateReceiptInt("t_out_receipt", toString(receipt.debtor), receiptId, "valid", 1, false);

        emit ReturnEnd(receipt.debtor, receipt.debtee, receiptId, amount);
    }
}
