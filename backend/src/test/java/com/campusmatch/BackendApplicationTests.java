package com.campusmatch;

import com.campusmatch.repository.GroupRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@EnabledIfEnvironmentVariable(named = "DB_URL", matches = ".+")
class BackendApplicationTests {
	@Autowired
	private GroupRepository groupRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void groupMetadataLoadsFromJsonb() {
		groupRepository.findAll().forEach(group -> {
			Assertions.assertNotNull(group.getTags());
			Assertions.assertNotNull(group.getRolesQuota());
		});
	}

}
