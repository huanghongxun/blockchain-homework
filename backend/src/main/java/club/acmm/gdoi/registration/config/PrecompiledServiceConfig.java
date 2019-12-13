package club.acmm.gdoi.registration.config;

import org.fisco.bcos.web3j.crypto.Credentials;
import org.fisco.bcos.web3j.precompile.crud.CRUDService;
import org.fisco.bcos.web3j.protocol.Web3j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PrecompiledServiceConfig {

    @Bean
    public CRUDService crudService(Web3j web3j, Credentials credentials) {
        return new CRUDService(web3j, credentials);
    }
}
