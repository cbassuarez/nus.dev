# The shell integration nus installs for zsh (via ZDOTDIR): OSC 133 prompt
# marks so the terminal can tell a prompt from a command from its output,
# and OSC 7 so it knows the working directory.
precmd()  { print -Pn "\e]133;D;$?\a"; print -Pn "\e]7;file://$PWD\a" }
preexec() { print -Pn "\e]133;C\a" }
PROMPT=$'%{\e]133;A\a%}%{\e[38;2;200;16;46m%}»%{\e[0m%} %{\e]133;B\a%}'
RPROMPT=''
setopt no_prompt_cr
unsetopt zle 2>/dev/null
