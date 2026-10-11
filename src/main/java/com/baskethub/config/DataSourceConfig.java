package com.baskethub.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Used ONLY when an environment variable DATABASE_URL exists (on Render).
 * Paste Render's "Internal Database URL" into it, for example:
 *   postgresql://USER:PASSWORD@HOST/DBNAME
 * The user, password, host and database name are all taken from that one value.
 * Spaces and line breaks around it are removed.
 * On your laptop DATABASE_URL does not exist, so this class does nothing.
 */
@Configuration
@Conditional(DataSourceConfig.DatabaseUrlPresent.class)
public class DataSourceConfig {

    static class DatabaseUrlPresent implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            String value = context.getEnvironment().getProperty("DATABASE_URL");
            return value != null && !value.trim().isEmpty();
        }
    }

    @Bean
    public DataSource dataSource(org.springframework.core.env.Environment env) throws Exception {
        String raw = env.getProperty("DATABASE_URL").trim();
        URI uri = new URI(raw);

        String userInfo = uri.getUserInfo();
        if (userInfo == null || !userInfo.contains(":")) {
            throw new IllegalStateException("DATABASE_URL must look like postgresql://USER:PASSWORD@HOST/DBNAME");
        }
        int colon = userInfo.indexOf(':');
        String user = userInfo.substring(0, colon).trim();
        String password = userInfo.substring(colon + 1).trim();

        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath();

        // Shows hidden spaces. The password itself is never printed.
        System.out.println("DB login check: user=[" + user + "] host=[" + uri.getHost()
                + "] database=[" + uri.getPath() + "] passwordLength=" + password.length());

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(user);
        ds.setPassword(password);
        ds.setMaximumPoolSize(5);
        return ds;
    }
}