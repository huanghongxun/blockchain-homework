package club.acmm.gdoi.registration.controller

import club.acmm.gdoi.registration.config.Constants
import club.acmm.gdoi.registration.contract.Transaction
import com.fasterxml.jackson.databind.ObjectMapper
import club.acmm.gdoi.registration.constants.GasConstants
import org.fisco.bcos.web3j.crypto.Credentials
import org.fisco.bcos.web3j.protocol.Web3j
import org.fisco.bcos.web3j.tx.gas.StaticGasProvider
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*
import java.math.BigInteger

@RequestMapping("/api/receipt/{receiptId}")
@RestController
class ReceiptController @Autowired constructor(
        val constants: Constants,
        val web3j: Web3j
) {
    private val logger = LoggerFactory.getLogger(UserReceiptController::class.java)
    private val mapper = ObjectMapper()

    @PutMapping("")
    fun acceptReceipt(@PathVariable receiptId: BigInteger,
                      @RequestHeader("Private-Key") privateKey: String) {
        val contract = Transaction.load(constants.contractAddress, web3j, Credentials.create(privateKey),
                StaticGasProvider(GasConstants.GAS_PRICE, GasConstants.GAS_LIMIT))
        val receipt = contract.acceptTransferCredit(receiptId, BigInteger.valueOf(1)).send()
        logger.debug("acceptReceipt:" + mapper.writeValueAsString(receipt))
    }

    @DeleteMapping("")
    fun declineReceipt(@PathVariable receiptId: BigInteger,
                       @RequestHeader("Private-Key") privateKey: String) {
        val contract = Transaction.load(constants.contractAddress, web3j, Credentials.create(privateKey),
                StaticGasProvider(GasConstants.GAS_PRICE, GasConstants.GAS_LIMIT))
        val receipt = contract.acceptTransferCredit(receiptId, BigInteger.valueOf(2)).send()
        logger.debug("declineReceipt:" + mapper.writeValueAsString(receipt))
    }
}
