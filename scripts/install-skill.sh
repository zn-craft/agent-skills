#!/usr/bin/env bash
# Install one skill from this repository into an agent's skills directory.
#
# Examples:
#   bash scripts/install-skill.sh my-skill --agent codex
#   bash scripts/install-skill.sh my-skill --agent claude --project
#   bash scripts/install-skill.sh my-skill --dest /path/to/skills --lang zh
#   curl -fsSL https://raw.githubusercontent.com/zn-craft/agent-skills/main/scripts/install-skill.sh | bash -s -- my-skill --agent codex

set -euo pipefail

REPO="zn-craft/agent-skills"
REF="main"

AGENT=""
DEST=""
GLOBAL=0
PROJECT=0
FORCE=0
SKILL=""
LANG=""

usage() {
  cat <<'EOF'
Install one skill from agent-skills into an agent's skills directory.

Usage:
  install-skill.sh <skill-name> --agent <name> [--global | --project] [--force]
  install-skill.sh <skill-name> --dest <dir> [--force]

Options:
  --agent <name>      Target agent: codex, claude, cursor, ... Required unless --dest is given
  --global            Install into the agent's user-level skills directory (default)
  --project           Install into ./.<name>/skills in the current project
  --dest <dir>        Install into an explicit skills directory
  --lang <en|zh>      Install this language version; defaults to en when present, otherwise zh
  --force             Replace an existing installation, keeping a timestamped backup
  -h, --help          Show this help

--global resolves $<NAME>_HOME/skills, falling back to ~/.<name>/skills; --project
resolves ./.<name>/skills. --dest and --global/--project cannot be combined.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --agent)
      AGENT="${2:-}"
      shift 2
      ;;
    --dest)
      DEST="${2:-}"
      shift 2
      ;;
    --global)
      GLOBAL=1
      shift
      ;;
    --project)
      PROJECT=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --lang)
      LANG="${2:-}"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [ -n "$SKILL" ]; then
        echo "Only one skill name is supported." >&2
        exit 2
      fi
      SKILL="$1"
      shift
      ;;
  esac
done

if [ -z "$SKILL" ]; then
  usage >&2
  exit 2
fi
case "$SKILL" in
  */* | . | ..)
    echo "Invalid skill name: $SKILL" >&2
    exit 2
    ;;
esac
case "$LANG" in
  "" | en | zh) ;;
  *)
    echo "Invalid --lang: $LANG (use en or zh)" >&2
    exit 2
    ;;
esac

if [ "$GLOBAL" -eq 1 ] && [ "$PROJECT" -eq 1 ]; then
  echo "Use either --global or --project, not both." >&2
  exit 2
fi
if [ -n "$DEST" ] && { [ "$GLOBAL" -eq 1 ] || [ "$PROJECT" -eq 1 ]; }; then
  echo "--dest cannot be combined with --global/--project." >&2
  exit 2
fi
if [ -z "$DEST" ] && [ -z "$AGENT" ]; then
  echo "Specify the target: --agent <name> (with --global or --project), or --dest <dir>." >&2
  usage >&2
  exit 2
fi

if [ -n "$AGENT" ]; then
  agent_input="$AGENT"
  AGENT="$(printf '%s' "$AGENT" | tr 'A-Z' 'a-z')"
  case "$AGENT" in
    "" | [!a-z0-9]* | */* | *\\* | *..* | *[!a-z0-9._-]*)
      echo "Invalid --agent: $agent_input (use a name such as codex or claude)" >&2
      exit 2
      ;;
  esac
fi

if [ -z "$DEST" ]; then
  if [ "$PROJECT" -eq 1 ]; then
    DEST="./.$AGENT/skills"
  else
    agent_env="$(printf '%s' "$AGENT" | tr 'a-z' 'A-Z' | tr '.-' '__')_HOME"
    agent_base="$(printenv "$agent_env" 2>/dev/null || true)"
    [ -n "$agent_base" ] || agent_base="$HOME/.$AGENT"
    DEST="$agent_base/skills"
  fi
fi

# 英文版在 skills/<名>/，中文版在 zh/<名>/；没指定语言时优先英文版。
find_skill() {
  local root="$1"
  if [ "$LANG" = "en" ]; then
    [ -f "$root/skills/$SKILL/SKILL.md" ] && printf '%s\n' "$root/skills/$SKILL"
  elif [ "$LANG" = "zh" ]; then
    [ -f "$root/zh/$SKILL/SKILL.md" ] && printf '%s\n' "$root/zh/$SKILL"
  elif [ -f "$root/skills/$SKILL/SKILL.md" ]; then
    printf '%s\n' "$root/skills/$SKILL"
  elif [ -f "$root/zh/$SKILL/SKILL.md" ]; then
    printf '%s\n' "$root/zh/$SKILL"
  fi
}

list_skills() {
  local root="$1" name langs
  for name in $(
    {
      find "$root/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null
      find "$root/zh" -mindepth 1 -maxdepth 1 -type d 2>/dev/null
    } | while IFS= read -r dir; do basename "$dir"; done | sort -u
  ); do
    langs=""
    [ -f "$root/skills/$name/SKILL.md" ] && langs="$langs en"
    [ -f "$root/zh/$name/SKILL.md" ] && langs="$langs zh"
    [ -n "$langs" ] || continue
    echo "  - $name [$(printf '%s' "$langs" | sed 's/^ //')]" >&2
  done
}

# Prefer the checkout this script lives in when it is run locally.
self_path="${BASH_SOURCE[0]:-}"
checkout_root=""
if [ -n "$self_path" ] && [ -f "$self_path" ]; then
  checkout_root="$(cd "$(dirname "$self_path")/.." && pwd)"
fi

tmp_dir=""
cleanup() {
  if [ -n "$tmp_dir" ] && [ -d "$tmp_dir" ]; then
    rm -rf "$tmp_dir"
  fi
}
trap cleanup EXIT

skill_src=""
if [ -n "$checkout_root" ] && [ -d "$checkout_root/skills" ]; then
  skill_src="$(find_skill "$checkout_root")"
  if [ -n "$skill_src" ]; then
    echo "Using local checkout: ${skill_src#"$checkout_root"/}"
  else
    echo "Skill '$SKILL' not found in this checkout ($checkout_root)." >&2
    echo "Available skills:" >&2
    list_skills "$checkout_root"
    exit 1
  fi
fi

if [ -z "$skill_src" ]; then
  command -v tar >/dev/null 2>&1 || {
    echo "Need tar to unpack the repository." >&2
    exit 1
  }
  tmp_dir="$(mktemp -d)"
  archive="$tmp_dir/repo.tar.gz"
  url="https://codeload.github.com/$REPO/tar.gz/refs/heads/$REF"
  echo "Downloading $REPO@$REF ..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$archive" || {
      echo "Download failed: $url" >&2
      exit 1
    }
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$archive" "$url" || {
      echo "Download failed: $url" >&2
      exit 1
    }
  else
    echo "Need curl or wget to download the repository." >&2
    exit 1
  fi
  tar -xzf "$archive" -C "$tmp_dir"
  repo_root="$(find "$tmp_dir" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
  if [ -z "$repo_root" ]; then
    echo "Downloaded archive is empty: $url" >&2
    exit 1
  fi
  skill_src="$(find_skill "$repo_root")"
  if [ -z "$skill_src" ]; then
    echo "Skill '$SKILL' not found in $REPO@$REF." >&2
    echo "Available skills:" >&2
    list_skills "$repo_root"
    exit 1
  fi
fi

mkdir -p "$DEST"
lang_parent="${skill_src%/*}"
lang_used="en"
[ "${lang_parent##*/}" = "zh" ] && lang_used="zh"
install_name="$SKILL"
[ "$lang_used" = "zh" ] && install_name="$SKILL-zh"
target="$DEST/$install_name"
if [ -e "$target" ]; then
  if [ "$FORCE" -eq 1 ]; then
    backup="$target.bak.$(date +%Y%m%d%H%M%S)"
    mv "$target" "$backup"
    echo "Moved existing installation to $backup"
  else
    echo "Already installed: $target" >&2
    echo "Re-run with --force to replace it." >&2
    exit 1
  fi
fi

cp -R "$skill_src" "$target"
echo "Installed $install_name ($lang_used) -> $target"
