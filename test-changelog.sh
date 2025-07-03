#!/bin/bash

# 测试脚本：提取changelog.md中指定版本的更新日志
# 作者：Cail Gainey <cailgainey@foxmail.com>

# 设置版本号
VERSION="1.0.3"
echo "测试版本号: ${VERSION}"

# 从changelog.md提取当前版本的更新日志
echo "尝试提取带日期的版本格式:"
CHANGELOG_CONTENT=$(awk -v ver="## \\[${VERSION}\\] -" '
  BEGIN { in_section=0; result=""; }
  $0 ~ ver { in_section=1; next; }
  in_section && $0 ~ /^## \[[0-9]+\.[0-9]+\.[0-9]+\]/ { in_section=0; }
  in_section { result = result $0 "\n"; }
  END { print result; }
' changelog.md)

# 去除开头的空行和结尾的多余空行
CHANGELOG_CONTENT=$(echo "$CHANGELOG_CONTENT" | sed '/./,$!d' | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')

echo "提取结果长度: ${#CHANGELOG_CONTENT}"

# 如果提取失败，则尝试不带日期的版本格式
if [ -z "$CHANGELOG_CONTENT" ]; then
  echo "尝试提取不带日期的版本格式:"
  
  CHANGELOG_CONTENT=$(awk -v ver="## \\[${VERSION}\\]" '
    BEGIN { in_section=0; result=""; }
    $0 ~ ver { in_section=1; next; }
    in_section && $0 ~ /^## \[[0-9]+\.[0-9]+\.[0-9]+\]/ { in_section=0; }
    in_section { result = result $0 "\n"; }
    END { print result; }
  ' changelog.md)
  
  # 再次清理
  CHANGELOG_CONTENT=$(echo "$CHANGELOG_CONTENT" | sed '/./,$!d' | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
fi

# 如果仍然提取失败，则尝试不带方括号的版本格式
if [ -z "$CHANGELOG_CONTENT" ]; then
  echo "尝试提取不带方括号的版本格式:"
  
  CHANGELOG_CONTENT=$(awk -v ver="## ${VERSION}" '
    BEGIN { in_section=0; result=""; }
    $0 ~ ver { in_section=1; next; }
    in_section && $0 ~ /^## [0-9]+\.[0-9]+\.[0-9]+/ { in_section=0; }
    in_section { result = result $0 "\n"; }
    END { print result; }
  ' changelog.md)
  
  # 再次清理
  CHANGELOG_CONTENT=$(echo "$CHANGELOG_CONTENT" | sed '/./,$!d' | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
fi

# 如果仍然提取失败，则使用默认消息
if [ -z "$CHANGELOG_CONTENT" ]; then
  echo "无法提取版本 ${VERSION} 的更新日志，使用默认消息"
  CHANGELOG_CONTENT="版本 ${VERSION} 发布"
fi

# 输出提取的更新日志
echo "提取的更新日志:"
echo "---开始---"
echo "$CHANGELOG_CONTENT"
echo "---结束---"

# 测试其他版本
echo -e "\n测试版本号: 1.0.2"
VERSION="1.0.2"
CHANGELOG_CONTENT=$(awk -v ver="## \\[${VERSION}\\]" '
  BEGIN { in_section=0; result=""; }
  $0 ~ ver { in_section=1; next; }
  in_section && $0 ~ /^## \[[0-9]+\.[0-9]+\.[0-9]+\]/ { in_section=0; }
  in_section { result = result $0 "\n"; }
  END { print result; }
' changelog.md)
CHANGELOG_CONTENT=$(echo "$CHANGELOG_CONTENT" | sed '/./,$!d' | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
echo "---开始---"
echo "$CHANGELOG_CONTENT"
echo "---结束---"
