FROM oven/bun:debian

# ユーザーの追加
ARG USERNAME=bun
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN apt-get update && apt-get upgrade && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME\
    && chmod 0440 /etc/sudoers.d/$USERNAME
