package club.acmm.gdoi.registration.controller

import club.acmm.gdoi.registration.config.Constants
import club.acmm.gdoi.registration.exception.BadRequestException
import club.acmm.gdoi.registration.model.Role
import club.acmm.gdoi.registration.model.UserRepository
import org.fisco.bcos.web3j.precompile.crud.CRUDService
import org.fisco.bcos.web3j.protocol.Web3j
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.rest.webmvc.ResourceNotFoundException
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*


@RequestMapping("/api/address/{address}")
@RestController
class AddressController @Autowired constructor(
        val userRepository: UserRepository,
        val constants: Constants,
        val web3j: Web3j,
        val crudService: CRUDService
) {
    fun getReceiptResponseFromMap(map: Map<String, String>) =
            UserController.ReceiptResponse(
                    debteeAddress = map["debtee"]!!,
                    debteeName = map["debteeName"] ?: "",
                    debtorAddress = map["debtor"]!!,
                    debtorName = map["debtorName"] ?: "",
                    id = map["receiptId"]?.toBigInteger() ?: (-1).toBigInteger(),
                    amount = map["amount"]?.toBigInteger() ?: (-1).toBigInteger(),
                    deadline = Date(map["deadline"]?.toLong() ?: 0),
                    valid = map["valid"]?.toInt() ?: 0
            )

    @GetMapping("")
    fun getUserProfile(@PathVariable address: String): UserController.UserProfileResponse {
        val user = userRepository.findByAddress(address)
                ?: throw BadRequestException("not recorded address")

        val companyTable = crudService.desc(constants.companyTable).apply { key = user.address }
        val companies = crudService.select(companyTable, companyTable.condition)
        if (companies.size != 1) throw ResourceNotFoundException("Company address " + user.address + " cannot be found in blockchain")
        val company = companies[0]

        val inReceiptTable = crudService.desc(constants.inReceiptTable).apply { key = user.address }
        val inReceipts = crudService.select(inReceiptTable, inReceiptTable.condition)
        val outReceiptTable = crudService.desc(constants.outReceiptTable).apply { key = user.address }
        val outReceipts = crudService.select(outReceiptTable, outReceiptTable.condition)

        return UserController.UserProfileResponse(
                id = user.id!!,
                address = user.address,
                publicKey = user.publicKey,
                username = user.username,
                name = user.name,
                role = user.role,
                admin = user.role == Role.ROLE_ADMIN,
                inBalance = company["in_balance"]!!.toBigInteger(),
                outBalance = company["out_balance"]!!.toBigInteger(),
                inReceipts = inReceipts.map(this::getReceiptResponseFromMap),
                outReceipts = outReceipts.map(this::getReceiptResponseFromMap)
        )
    }
}
