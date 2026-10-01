package com.infosys.water_management;

import com.infosys.water_management.repository.UserRepository;
import com.infosys.water_management.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class WaterManagementApplicationTests {

	@MockBean
	private UserRepository userRepository;

	@MockBean
	private JwtService jwtService;

	@Test
	void contextLoads() {
	}

}
