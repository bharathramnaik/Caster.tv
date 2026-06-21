-- Migration 002: Seed Data
-- Default templates for cricket, football, etc.

-- Insert default admin user (password: admin123 - change in production!)
INSERT INTO users (email, name, role, password_hash) VALUES
  ('admin@sportscaster.local', 'System Admin', 'admin', '$2b$10$placeholder_hash_here')
ON CONFLICT (email) DO NOTHING;

-- Get admin user ID for foreign key references
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@sportscaster.local';

  -- Cricket Scoreboard Template
  INSERT INTO templates (name, category, sport, definition, is_public, created_by) VALUES
    ('Cricket Scoreboard', 'scoreboard', 'cricket', '{
      "version": "1.0",
      "dimensions": { "width": 1920, "height": 200 },
      "elements": [
        {
          "id": "team-a-name",
          "type": "text",
          "position": { "x": 50, "y": 30, "width": 400, "height": 60 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 36,
            "fontWeight": "bold",
            "color": "#ffffff",
            "textShadow": "2px 2px 4px rgba(0,0,0,0.8)"
          },
          "binding": "{teamA.name}"
        },
        {
          "id": "team-a-score",
          "type": "text",
          "position": { "x": 500, "y": 20, "width": 200, "height": 80 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 64,
            "fontWeight": "bold",
            "color": "#00ff00"
          },
          "binding": "{teamA.runs}/{teamA.wickets}"
        },
        {
          "id": "team-a-overs",
          "type": "text",
          "position": { "x": 720, "y": 40, "width": 150, "height": 50 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 28,
            "color": "#cccccc"
          },
          "binding": "({teamA.overs} ov)"
        },
        {
          "id": "team-b-name",
          "type": "text",
          "position": { "x": 950, "y": 30, "width": 400, "height": 60 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 36,
            "fontWeight": "bold",
            "color": "#ffffff",
            "textShadow": "2px 2px 4px rgba(0,0,0,0.8)"
          },
          "binding": "{teamB.name}"
        },
        {
          "id": "team-b-score",
          "type": "text",
          "position": { "x": 1400, "y": 20, "width": 200, "height": 80 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 64,
            "fontWeight": "bold",
            "color": "#00ff00"
          },
          "binding": "{teamB.runs}/{teamB.wickets}"
        },
        {
          "id": "team-b-overs",
          "type": "text",
          "position": { "x": 1620, "y": 40, "width": 150, "height": 50 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 28,
            "color": "#cccccc"
          },
          "binding": "({teamB.overs} ov)"
        },
        {
          "id": "match-status",
          "type": "text",
          "position": { "x": 760, "y": 140, "width": 400, "height": 40 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 24,
            "color": "#ffcc00",
            "textAlign": "center"
          },
          "binding": "{matchStatus}"
        },
        {
          "id": "bg-gradient",
          "type": "rect",
          "position": { "x": 0, "y": 0, "width": 1920, "height": 200 },
          "style": {
            "fill": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            "borderBottom": "3px solid #e94560"
          }
        }
      ],
      "animations": {
        "enter": { "type": "slideUp", "duration": 500 },
        "exit": { "type": "slideDown", "duration": 400 }
      }
    }', true, admin_user_id)
  ON CONFLICT DO NOTHING;

  -- Football Score Bug Template
  INSERT INTO templates (name, category, sport, definition, is_public, created_by) VALUES
    ('Football Score Bug', 'scoreboard', 'football', '{
      "version": "1.0",
      "dimensions": { "width": 400, "height": 80 },
      "elements": [
        {
          "id": "team-a-badge",
          "type": "image",
          "position": { "x": 10, "y": 10, "width": 60, "height": 60 },
          "binding": "{teamA.badge}"
        },
        {
          "id": "team-a-name",
          "type": "text",
          "position": { "x": 80, "y": 15, "width": 120, "height": 25 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 18,
            "fontWeight": "bold",
            "color": "#ffffff"
          },
          "binding": "{teamA.short}"
        },
        {
          "id": "team-a-score",
          "type": "text",
          "position": { "x": 80, "y": 40, "width": 50, "height": 30 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 28,
            "color": "#ffffff"
          },
          "binding": "{teamA.score}"
        },
        {
          "id": "divider",
          "type": "text",
          "position": { "x": 185, "y": 20, "width": 30, "height": 40 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 32,
            "color": "#888888"
          },
          "value": "-"
        },
        {
          "id": "team-b-badge",
          "type": "image",
          "position": { "x": 330, "y": 10, "width": 60, "height": 60 },
          "binding": "{teamB.badge}"
        },
        {
          "id": "team-b-name",
          "type": "text",
          "position": { "x": 200, "y": 15, "width": 120, "height": 25 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 18,
            "fontWeight": "bold",
            "color": "#ffffff",
            "textAlign": "right"
          },
          "binding": "{teamB.short}"
        },
        {
          "id": "team-b-score",
          "type": "text",
          "position": { "x": 270, "y": 40, "width": 50, "height": 30 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 28,
            "color": "#ffffff",
            "textAlign": "right"
          },
          "binding": "{teamB.score}"
        },
        {
          "id": "time",
          "type": "text",
          "position": { "x": 160, "y": 55, "width": 80, "height": 20 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 14,
            "color": "#ffcc00"
          },
          "binding": "{matchTime}"
        },
        {
          "id": "bg-rect",
          "type": "rect",
          "position": { "x": 0, "y": 0, "width": 400, "height": 80 },
          "style": {
            "fill": "rgba(0, 0, 0, 0.85)",
            "borderRadius": "8px",
            "border": "2px solid #333"
          }
        }
      ],
      "animations": {
        "enter": { "type": "slideRight", "duration": 400 },
        "exit": { "type": "slideRight", "duration": 300, "reverse": true }
      }
    }', true, admin_user_id)
  ON CONFLICT DO NOTHING;

  -- Lower Third Name Band Template
  INSERT INTO templates (name, category, sport, definition, is_public, created_by) VALUES
    ('Lower Third Name Band', 'lower-third', 'generic', '{
      "version": "1.0",
      "dimensions": { "width": 800, "height": 120 },
      "elements": [
        {
          "id": "name-bg",
          "type": "rect",
          "position": { "x": 0, "y": 0, "width": 800, "height": 70 },
          "style": {
            "fill": "linear-gradient(90deg, #e94560 0%, #e94560 70%, transparent 100%)"
          }
        },
        {
          "id": "name-text",
          "type": "text",
          "position": { "x": 30, "y": 10, "width": 740, "height": 50 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 36,
            "fontWeight": "bold",
            "color": "#ffffff"
          },
          "binding": "{name}"
        },
        {
          "id": "title-bg",
          "type": "rect",
          "position": { "x": 0, "y": 75, "width": 600, "height": 45 },
          "style": {
            "fill": "rgba(0, 0, 0, 0.9)"
          }
        },
        {
          "id": "title-text",
          "type": "text",
          "position": { "x": 30, "y": 80, "width": 540, "height": 35 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 22,
            "color": "#cccccc"
          },
          "binding": "{title}"
        },
        {
          "id": "accent-line",
          "type": "rect",
          "position": { "x": 0, "y": 0, "width": 8, "height": 120 },
          "style": { "fill": "#ffd700" }
        }
      ],
      "animations": {
        "enter": { "type": "slideRight", "duration": 500 },
        "exit": { "type": "slideRight", "duration": 400, "reverse": true }
      }
    }', true, admin_user_id)
  ON CONFLICT DO NOTHING;

  -- Breaking News Banner Template
  INSERT INTO templates (name, category, sport, definition, is_public, created_by) VALUES
    ('Breaking News Banner', 'breaking-news', 'generic', '{
      "version": "1.0",
      "dimensions": { "width": 1920, "height": 150 },
      "elements": [
        {
          "id": "banner-bg",
          "type": "rect",
          "position": { "x": 0, "y": 0, "width": 1920, "height": 150 },
          "style": {
            "fill": "linear-gradient(180deg, #cc0000 0%, #990000 100%)"
          }
        },
        {
          "id": "breaking-label",
          "type": "rect",
          "position": { "x": 50, "y": 20, "width": 250, "height": 50 },
          "style": {
            "fill": "#ffffff",
            "borderRadius": "5px"
          }
        },
        {
          "id": "breaking-text",
          "type": "text",
          "position": { "x": 60, "y": 25, "width": 230, "height": 40 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 28,
            "fontWeight": "bold",
            "color": "#cc0000",
            "textAlign": "center"
          },
          "value": "BREAKING NEWS"
        },
        {
          "id": "headline",
          "type": "text",
          "position": { "x": 50, "y": 85, "width": 1820, "height": 50 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 32,
            "fontWeight": "bold",
            "color": "#ffffff"
          },
          "binding": "{headline}"
        },
        {
          "id": "scroll-bar",
          "type": "rect",
          "position": { "x": 0, "y": 145, "width": 1920, "height": 5 },
          "style": { "fill": "#ffd700" }
        }
      ],
      "animations": {
        "enter": { "type": "slideDown", "duration": 300 },
        "exit": { "type": "slideUp", "duration": 300 }
      }
    }', true, admin_user_id)
  ON CONFLICT DO NOTHING;

  -- Player Profile Card Template
  INSERT INTO templates (name, category, sport, definition, is_public, created_by) VALUES
    ('Player Profile Card', 'player-card', 'cricket', '{
      "version": "1.0",
      "dimensions": { "width": 400, "height": 500 },
      "elements": [
        {
          "id": "card-bg",
          "type": "rect",
          "position": { "x": 0, "y": 0, "width": 400, "height": 500 },
          "style": {
            "fill": "linear-gradient(180deg, #1a1a2e 0%, #0f3460 100%)",
            "borderRadius": "15px",
            "border": "2px solid #e94560"
          }
        },
        {
          "id": "player-photo",
          "type": "image",
          "position": { "x": 120, "y": 20, "width": 160, "height": 200 },
          "style": {
            "borderRadius": "10px",
            "border": "3px solid #ffd700"
          },
          "binding": "{player.photo}"
        },
        {
          "id": "player-name",
          "type": "text",
          "position": { "x": 20, "y": 240, "width": 360, "height": 50 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 32,
            "fontWeight": "bold",
            "color": "#ffffff",
            "textAlign": "center"
          },
          "binding": "{player.name}"
        },
        {
          "id": "player-role",
          "type": "text",
          "position": { "x": 20, "y": 290, "width": 360, "height": 30 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 20,
            "color": "#ffd700",
            "textAlign": "center"
          },
          "binding": "{player.role}"
        },
        {
          "id": "stats-divider",
          "type": "rect",
          "position": { "x": 20, "y": 330, "width": 360, "height": 2 },
          "style": { "fill": "#e94560" }
        },
        {
          "id": "stat-1-label",
          "type": "text",
          "position": { "x": 20, "y": 350, "width": 110, "height": 25 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 14,
            "color": "#888888"
          },
          "binding": "{stat1.label}"
        },
        {
          "id": "stat-1-value",
          "type": "text",
          "position": { "x": 20, "y": 375, "width": 110, "height": 40 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 28,
            "color": "#ffffff",
            "textAlign": "center"
          },
          "binding": "{stat1.value}"
        },
        {
          "id": "stat-2-label",
          "type": "text",
          "position": { "x": 145, "y": 350, "width": 110, "height": 25 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 14,
            "color": "#888888"
          },
          "binding": "{stat2.label}"
        },
        {
          "id": "stat-2-value",
          "type": "text",
          "position": { "x": 145, "y": 375, "width": 110, "height": 40 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 28,
            "color": "#ffffff",
            "textAlign": "center"
          },
          "binding": "{stat2.value}"
        },
        {
          "id": "stat-3-label",
          "type": "text",
          "position": { "x": 270, "y": 350, "width": 110, "height": 25 },
          "style": {
            "fontFamily": "Arial",
            "fontSize": 14,
            "color": "#888888"
          },
          "binding": "{stat3.label}"
        },
        {
          "id": "stat-3-value",
          "type": "text",
          "position": { "x": 270, "y": 375, "width": 110, "height": 40 },
          "style": {
            "fontFamily": "Arial Black",
            "fontSize": 28,
            "color": "#ffffff",
            "textAlign": "center"
          },
          "binding": "{stat3.value}"
        },
        {
          "id": "team-badge",
          "type": "image",
          "position": { "x": 150, "y": 440, "width": 100, "height": 50 },
          "style": { "objectFit": "contain" },
          "binding": "{team.badge}"
        }
      ],
      "animations": {
        "enter": { "type": "scaleIn", "duration": 400 },
        "exit": { "type": "scaleOut", "duration": 300 }
      }
    }', true, admin_user_id)
  ON CONFLICT DO NOTHING;

  -- Insert default project
  INSERT INTO projects (name, description, owner_id, settings) VALUES
    ('Default Project', 'Main broadcast project', admin_user_id, '{
      "resolution": "1920x1080",
      "fps": 60,
      "defaultTransition": "crossfade",
      "transitionDuration": 500
    }')
  ON CONFLICT DO NOTHING;

END $$;
