package club.acmm.gdoi.registration.controller

import club.acmm.gdoi.registration.config.Constants
import club.acmm.gdoi.registration.contract.Transaction
import com.fasterxml.jackson.databind.ObjectMapper
import club.acmm.gdoi.registration.constants.GasConstants
import org.fisco.bcos.web3j.crypto.Credentials
import org.fisco.bcos.web3j.protocol.Web3j
import org.fisco.bcos.web3j.tx.gas.StaticGasProvider
import org.slf4j.LoggerFactory
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.math.BigInteger
import java.util.*


@RequestMapping("/api/user")
@RestController
class UserReceiptController(
        val constants: Constants,
        val web3j: Web3j
) {
    private val logger = LoggerFactory.getLogger(UserReceiptController::class.java)
    private val mapper = ObjectMapper()

    class TransferRequest(
            val amount: BigInteger,
            val deadline: Date
    )

    @PostMapping("/transfer/{debteeAddress}")
    @PreAuthorize("isFullyAuthenticated()")
    fun transferCredit(@PathVariable debteeAddress: String,
                       @RequestHeader("Private-Key") privateKey: String,
                       @RequestBody request: TransferRequest) {
        val contract = Transaction.load(constants.contractAddress, web3j, Credentials.create(privateKey),
                StaticGasProvider(GasConstants.GAS_PRICE, GasConstants.GAS_LIMIT))
        val receipt = contract.transferCredit(debteeAddress, request.amount, BigInteger.valueOf(request.deadline.time)).send()
        logger.debug("TransferCredit:" + mapper.writeValueAsString(receipt))
    }

    class ReturnRequest(
            val amount: BigInteger
    )

    /**
     * 标记当前教练是否以缴费
     */
    @Transactional
    @PostMapping("/return/{receiptId}")
    @PreAuthorize("isFullyAuthenticated()")
    fun returnCredit(authentication: Authentication,
                     @RequestHeader("Private-Key") privateKey: String,
                     @PathVariable receiptId: BigInteger,
                     @RequestBody request: ReturnRequest) {
        val contract = Transaction.load(constants.contractAddress, web3j, Credentials.create(privateKey),
                StaticGasProvider(GasConstants.GAS_PRICE, GasConstants.GAS_LIMIT))
        val receipt = contract.returnCredit(receiptId, request.amount).send()
        logger.debug("ReturnCredit:" + mapper.writeValueAsString(receipt))
    }
}
