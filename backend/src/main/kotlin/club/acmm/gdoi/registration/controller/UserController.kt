package club.acmm.gdoi.registration.controller

import club.acmm.gdoi.registration.config.Constants
import club.acmm.gdoi.registration.contract.Transaction
import club.acmm.gdoi.registration.exception.BadRequestException
import club.acmm.gdoi.registration.model.*
import club.acmm.gdoi.registration.security.JwtTokenProvider
import club.acmm.gdoi.registration.security.UserPrincipal
import club.acmm.gdoi.registration.security.WebSecurity
import com.fasterxml.jackson.databind.ObjectMapper
import club.acmm.gdoi.registration.constants.GasConstants
import org.fisco.bcos.web3j.crypto.Credentials
import org.fisco.bcos.web3j.crypto.gm.GenCredential
import org.fisco.bcos.web3j.precompile.crud.CRUDService
import org.fisco.bcos.web3j.protocol.Web3j
import org.fisco.bcos.web3j.tx.gas.StaticGasProvider
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.data.rest.webmvc.ResourceNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.math.BigInteger
import java.util.*
import javax.servlet.http.HttpSession
import javax.transaction.Transactional
import javax.validation.Valid
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Size

@RequestMapping("/api/user")
@RestController
class UserController @Autowired constructor(
        val authenticationManager: AuthenticationManager,
        val userRepository: UserRepository,
        val passwordEncoder: PasswordEncoder,
        val tokenProvider: JwtTokenProvider,
        val webSecurity: WebSecurity,
        val constants: Constants,
        val web3j: Web3j,
        val credentials: Credentials,
        val crudService: CRUDService,
        val governmentCompanyRepository: GovernmentCompanyRepository
) {
    private val logger = LoggerFactory.getLogger(UserController::class.java)
    private val mapper = ObjectMapper()

    class LoginRequest(
            @NotBlank val username: String,
            @NotBlank val password: String
    )

    class LoginResponse(
            val accessToken: String,
            val tokenType: String = "Bearer",
            var username: String,
            var name: String,
            var role: Role
    )

    /**
     * Request Body: {
     *     "usernameOrEmail": "<username> or <email>",
     *     "password": "encrypted password"
     * },
     * Response Body: {
     *     "accessToken": "<access token>",
     *     "tokenType": "Bearer",
     *     "username": "<username>",
     *     "contestId": <contestId>,
     *     "email": "<email>",
     *     "role": "<role>"
     * }
     */
    @PostMapping("/login")
    fun login(@Valid @RequestBody loginRequest: LoginRequest): ResponseEntity<LoginResponse> {
        val auth = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(
                        loginRequest.username,
                        loginRequest.password
                )
        )
        val userPrincipal = auth.principal as UserPrincipal

        SecurityContextHolder.getContext().authentication = auth

        val jwt = tokenProvider.generateToken(auth)
        val user = userRepository.findByIdOrNull(userPrincipal.id)
                ?: throw BadRequestException("session malformed")
        return ResponseEntity.ok(LoginResponse(
                jwt,
                "Bearer",
                user.username,
                user.name,
                user.role))
    }

    @GetMapping("/logout")
    fun logout(session: HttpSession) {
        session.invalidate()
    }

    class ReceiptResponse(
            val debtorAddress: String,
            val debtorName: String,
            val debteeAddress: String,
            val debteeName: String,
            val id: BigInteger,
            val amount: BigInteger,
            val deadline: Date,
            val valid: Int
    )

    fun getReceiptResponseFromMap(map: Map<String, String>) =
            ReceiptResponse(
                    debteeAddress = map["debtee"]!!,
                    debteeName = map["debteeName"] ?: "",
                    debtorAddress = map["debtor"]!!,
                    debtorName = map["debtorName"] ?: "",
                    id = map["receiptId"]?.toBigInteger() ?: (-1).toBigInteger(),
                    amount = map["amount"]?.toBigInteger() ?: (-1).toBigInteger(),
                    deadline = Date(map["deadline"]?.toLong() ?: 0),
                    valid = map["valid"]?.toInt() ?: 0
            )

    @GetMapping("/checkAvailability")
    fun checkAvailability(@RequestParam username: String?,
                          @RequestParam name: String?): Availability {
        if (username != null) {
            return Availability(!userRepository.existsByUsername(username))
        } else if (name != null) {
            return Availability(!userRepository.existsByName(name))
        } else {
            throw BadRequestException("Either 'username' or 'email' request param should exist.");
        }
    }

    class UserProfileResponse(
            val id: Long,
            val address: String,
            val publicKey: String,
            val username: String,
            val name: String,
            val role: Role,
            val admin: Boolean,
            val inBalance: BigInteger? = null,
            val outBalance: BigInteger? = null,
            val inReceipts: List<ReceiptResponse>? = null,
            val outReceipts: List<ReceiptResponse>? = null
    )

    @GetMapping("/profile")
    @PreAuthorize("isFullyAuthenticated()")
    fun getUserProfile(@AuthenticationPrincipal userPrincipal: UserPrincipal): UserProfileResponse {
        return getUserProfile(userPrincipal.id)
    }

    @GetMapping("/{userId}")
    fun getUserProfile(@PathVariable userId: Long): UserProfileResponse {
        val user = userRepository.findByIdOrNull(userId)
                ?: throw BadRequestException("session malformed")

        val companyTable = crudService.desc(constants.companyTable).apply { key = user.address }
        val companies = crudService.select(companyTable, companyTable.condition)
        if (companies.size != 1) throw ResourceNotFoundException("Company address " + user.address + " cannot be found in blockchain")
        val company = companies[0]

        val inReceiptTable = crudService.desc(constants.inReceiptTable).apply { key = user.address }
        val inReceipts = crudService.select(inReceiptTable, inReceiptTable.condition)
        val outReceiptTable = crudService.desc(constants.outReceiptTable).apply { key = user.address }
        val outReceipts = crudService.select(outReceiptTable, outReceiptTable.condition)

        return UserProfileResponse(
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

    class RegisterRequest(
            @NotBlank @Size(min = 4, max = 40) val username: String,
            @NotBlank @Size(max = 32) val name: String,
            @NotBlank @Size(max = 512) val password: String,
            @NotBlank @Size(max = 64) val government: String?,
            @NotBlank val role: Role
    )

    class RegisterResponse(
            val address: String,
            val privateKey: String,
            val publicKey: String
    )

    @PostMapping("/register")
    @Transactional
    fun register(@Valid @RequestBody registerRequest: RegisterRequest): RegisterResponse {
        if (userRepository.existsByUsername(registerRequest.username))
            throw BadRequestException("Username is already taken")
        if (userRepository.existsByName(registerRequest.name))
            throw BadRequestException("Username is already taken")

        val government = if (registerRequest.role == Role.ROLE_COMPANY) {
            userRepository.findByUsername(registerRequest.government
                    ?: throw BadRequestException("Government must be provided if company registration"))
                    ?: throw BadRequestException("Government does not exist")
        } else {
            null
        }

        val credentials: Credentials
        if (registerRequest.role == Role.ROLE_ADMIN) {
            if (userRepository.existsByRole(Role.ROLE_ADMIN))
                throw BadRequestException("Admin already registered")
            credentials = this.credentials
        } else {
            credentials = GenCredential.create()
        }

        val user = User(
                username = registerRequest.username,
                name = registerRequest.name,
                address = credentials.address,
                publicKey = credentials.ecKeyPair.publicKey.toString(16),
                password = passwordEncoder.encode(registerRequest.password),
                role = registerRequest.role,
                status = UserStatus.SUBMITTED
        )

        userRepository.save(user)

        if (registerRequest.role == Role.ROLE_COMPANY) {
            governmentCompanyRepository.save(GovernmentCompany(
                    government = government!!,
                    company = user
            ))
        }

        return RegisterResponse(
                address = credentials.address,
                publicKey = credentials.ecKeyPair.publicKey.toString(16),
                privateKey = credentials.ecKeyPair.privateKey.toString(16)
        )
    }

    @GetMapping("/government")
    fun getGovernments(): List<UserProfileResponse> {
        return userRepository.findAllByRole(Role.ROLE_GOVERNMENT).map { user ->
            UserProfileResponse(
                    id = user.id!!,
                    address = user.address,
                    publicKey = user.publicKey,
                    username = user.username,
                    name = user.name,
                    role = user.role,
                    admin = user.role == Role.ROLE_ADMIN
            )
        }
    }

    @GetMapping("/bank")
    fun getBanks(): List<UserProfileResponse> {
        return userRepository.findAllByRole(Role.ROLE_BANK).map { user ->
            UserProfileResponse(
                    id = user.id!!,
                    address = user.address,
                    publicKey = user.publicKey,
                    username = user.username,
                    name = user.name,
                    role = user.role,
                    admin = user.role == Role.ROLE_ADMIN
            )
        }
    }

    @GetMapping("/company")
    fun getCompanies(): List<UserProfileResponse> {
        return userRepository.findAllByRole(Role.ROLE_COMPANY).map { user ->
            UserProfileResponse(
                    id = user.id!!,
                    address = user.address,
                    publicKey = user.publicKey,
                    username = user.username,
                    name = user.name,
                    role = user.role,
                    admin = user.role == Role.ROLE_ADMIN
            )
        }
    }

    /**
     * Verify information of coach identified by coachId.
     *
     * Auth: only the super admin can can do this operation.
     */
    @GetMapping("/{userId}/audit")
    @PreAuthorize("isFullyAuthenticated()")
    fun audit(authentication: Authentication,
              @RequestHeader("Private-Key") privateKey: String,
              @PathVariable userId: Long) {
        val user = userRepository.findByIdOrNull(userId) ?: throw ResourceNotFoundException()

        // 只有管理员能确认教练账户的正确性
        if (!(user.role == Role.ROLE_COMPANY && webSecurity.checkUserRole(authentication, Role.ROLE_GOVERNMENT.toString()) ||
                        (user.role == Role.ROLE_BANK || user.role == Role.ROLE_GOVERNMENT) && webSecurity.isAdmin(authentication)))
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

        if (user.status >= UserStatus.ACCEPTED)
            throw BadRequestException("User has been accepted")

        val contract = Transaction.load(constants.contractAddress, web3j, Credentials.create(privateKey),
                StaticGasProvider(GasConstants.GAS_PRICE, GasConstants.GAS_LIMIT))

        val receipt = when (user.role) {
            Role.ROLE_COMPANY -> contract.registerCompany(user.address, user.name).send()
            Role.ROLE_BANK -> contract.registerBank(user.address, user.name).send()
            Role.ROLE_GOVERNMENT -> contract.registerGovernment(user.address, user.name).send()
            else -> throw IllegalStateException("Incorrect user role")
        }

        logger.debug("audit:" + mapper.writeValueAsString(receipt))
        user.status = UserStatus.ACCEPTED

        userRepository.save(user)
    }

    /**
     * Undo verification of user
     */
    @DeleteMapping("/{userId}/audit")
    @PreAuthorize("isFullyAuthenticated()")
    fun revertAudit(authentication: Authentication,
                    @RequestHeader("Private-Key") privateKey: String,
                    @PathVariable userId: Long) {
        val user = userRepository.findByIdOrNull(userId) ?: throw ResourceNotFoundException()

        if (!(user.role == Role.ROLE_COMPANY && webSecurity.checkUserRole(authentication, Role.ROLE_GOVERNMENT.toString()) ||
                        (user.role == Role.ROLE_BANK || user.role == Role.ROLE_GOVERNMENT) && webSecurity.isAdmin(authentication)))
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

        if (user.status == UserStatus.REJECTED)
            throw BadRequestException("User has been rejected")
        user.status = UserStatus.REJECTED

        userRepository.save(user)
    }

    data class UnauditedUser(
            val id: Long,
            val username: String,
            val name: String,
            val publicKey: String,
            val address: String,
            val role: Role
    )

    @GetMapping("/audit-list")
    @PreAuthorize("isFullyAuthenticated()")
    @Transactional
    fun getUnauditedUsers(authentication: Authentication): List<UnauditedUser> {
        val user = authentication.principal as UserPrincipal
        if (webSecurity.checkUserRole(authentication, Role.ROLE_ADMIN.toString())) {
            return userRepository.findAllByRoleAndStatus(listOf(Role.ROLE_GOVERNMENT, Role.ROLE_BANK), listOf(UserStatus.SUBMITTED)).map {
                UnauditedUser(
                        id = it.id!!,
                        username = it.username,
                        name = it.name,
                        publicKey = it.publicKey,
                        address = it.address,
                        role = it.role
                )
            }
        } else if (webSecurity.checkUserRole(authentication, Role.ROLE_GOVERNMENT.toString())) {
            return governmentCompanyRepository.findAllCompaniesByGovernmentAndStatus(user.id, UserStatus.SUBMITTED).map {
                UnauditedUser(
                        id = it.id!!,
                        username = it.username,
                        name = it.name,
                        publicKey = it.publicKey,
                        address = it.address,
                        role = it.role
                )
            }
        } else {
            return emptyList()
        }
    }

    data class AuditedUser(
            val id: Long,
            val username: String,
            val name: String,
            val publicKey: String,
            val address: String,
            val role: Role
    )

    @GetMapping("/audited-list")
    @PreAuthorize("#isFullyAuthenticated()")
    @Transactional
    fun getAuditedUsers(authentication: Authentication): List<AuditedUser> {
        val user = authentication.principal as UserPrincipal
        if (webSecurity.checkUserRole(authentication, Role.ROLE_ADMIN.toString())) {
            return userRepository.findAllByRoleAndStatus(listOf(Role.ROLE_GOVERNMENT, Role.ROLE_BANK), listOf(UserStatus.ACCEPTED)).map {
                AuditedUser(
                        id = it.id!!,
                        username = it.username,
                        name = it.name,
                        publicKey = it.publicKey,
                        address = it.address,
                        role = it.role
                )
            }
        } else if (webSecurity.checkUserRole(authentication, Role.ROLE_GOVERNMENT.toString())) {
            return governmentCompanyRepository.findAllCompaniesByGovernmentAndStatus(user.id, UserStatus.ACCEPTED).map {
                AuditedUser(
                        id = it.id!!,
                        username = it.username,
                        name = it.name,
                        publicKey = it.publicKey,
                        address = it.address,
                        role = it.role
                )
            }
        } else {
            return emptyList()
        }
    }
}
