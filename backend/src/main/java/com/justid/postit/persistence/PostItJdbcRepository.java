package com.justid.postit.persistence;

import com.justid.postit.domain.PostIt;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class PostItJdbcRepository {

    private static final RowMapper<PostIt> ROW_MAPPER = (rs, rowNum) -> new PostIt(
            rs.getLong("id"),
            rs.getLong("user_id"),
            rs.getString("title"),
            rs.getString("description"),
            rs.getString("tags"),
            rs.getTimestamp("created_at").toInstant(),
            rs.getDate("deadline_date") != null ? rs.getDate("deadline_date").toLocalDate() : null,
            rs.getBoolean("completed"),
            rs.getBoolean("archived"),
            rs.getDouble("position_x"),
            rs.getDouble("position_y"),
            rs.getInt("z_index"),
            rs.getString("color_hex")
    );

    private final JdbcTemplate jdbcTemplate;

    public PostItJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PostIt> findByUserId(long userId) {
        return jdbcTemplate.query(
                "SELECT id, user_id, title, description, tags, created_at, deadline_date, completed, archived, position_x, position_y, z_index, color_hex "
                        + "FROM post_its WHERE user_id = ? ORDER BY z_index DESC, id",
                ROW_MAPPER,
                userId
        );
    }

    public List<PostIt> findByTag(String tag) {
        return jdbcTemplate.query(
                "SELECT id, user_id, title, description, tags, created_at, deadline_date, completed, archived, position_x, position_y, z_index, color_hex "
                        + "FROM post_its WHERE tags = ? ORDER BY z_index DESC, id",
                ROW_MAPPER,
                tag
        );
    }

    public Optional<PostIt> findById(long id) {
        try {
            PostIt p = jdbcTemplate.queryForObject(
                    "SELECT id, user_id, title, description, tags, created_at, deadline_date, completed, archived, position_x, position_y, z_index, color_hex "
                            + "FROM post_its WHERE id = ?",
                    ROW_MAPPER,
                    id
            );
            return Optional.ofNullable(p);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public long insert(long userId, String title, String description, String tags, LocalDate deadline,
                       double positionX, double positionY, int zIndex, String colorHex) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO post_its (user_id, title, description, tags, deadline_date, position_x, position_y, z_index, color_hex) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, userId);
            ps.setString(2, title);
            ps.setString(3, description);
            ps.setString(4, tags);
            if (deadline != null) {
                ps.setDate(5, Date.valueOf(deadline));
            } else {
                ps.setNull(5, java.sql.Types.DATE);
            }
            ps.setDouble(6, positionX);
            ps.setDouble(7, positionY);
            ps.setInt(8, zIndex);
            ps.setString(9, colorHex);
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Geen gegenereerde sleutel na insert van post-it");
        }
        return key.longValue();
    }

    public boolean update(long id, String title, String description, String tags, LocalDate deadline,
                          boolean completed, boolean archived, double positionX, double positionY, int zIndex,
                          String colorHex) {
        int rows = jdbcTemplate.update(
                "UPDATE post_its SET title = ?, description = ?, tags = ?, deadline_date = ?, "
                        + "completed = ?, archived = ?, position_x = ?, position_y = ?, z_index = ?, color_hex = ? WHERE id = ?",
                title,
                description,
                tags,
                deadline != null ? Date.valueOf(deadline) : null,
                completed,
                archived,
                positionX,
                positionY,
                zIndex,
                colorHex,
                id
        );
        return rows == 1;
    }

    public boolean updatePosition(long id, double x, double y, Integer zIndex) {
        if (zIndex != null) {
            int rows = jdbcTemplate.update(
                    "UPDATE post_its SET position_x = ?, position_y = ?, z_index = ? WHERE id = ?",
                    x, y, zIndex, id
            );
            return rows == 1;
        }
        int rows = jdbcTemplate.update(
                "UPDATE post_its SET position_x = ?, position_y = ? WHERE id = ?",
                x, y, id
        );
        return rows == 1;
    }

    public boolean updateArchived(long id, boolean archived) {
        int rows = jdbcTemplate.update("UPDATE post_its SET archived = ? WHERE id = ?", archived, id);
        return rows == 1;
    }

    public boolean updateCompleted(long id, boolean completed) {
        int rows = jdbcTemplate.update("UPDATE post_its SET completed = ? WHERE id = ?", completed, id);
        return rows == 1;
    }

    public boolean delete(long id) {
        int rows = jdbcTemplate.update("DELETE FROM post_its WHERE id = ?", id);
        return rows == 1;
    }

    public int countOpenForUser(long userId) {
        Integer n = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM post_its WHERE user_id = ? AND archived = 0 AND completed = 0",
                Integer.class,
                userId
        );
        return n != null ? n : 0;
    }
}
