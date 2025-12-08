FROM ghcr.io/lllyasviel/stable-diffusion-webui-forge:latest

ARG DEFORUM_MEDIATOR_URL=ws://host.docker.internal:8765
ENV DEFORUM_MEDIATOR_URL=${DEFORUM_MEDIATOR_URL}

WORKDIR /stable-diffusion-webui

# Install tools needed to unpack the bundled Deforumation build of Deforum.
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends p7zip-full git && \
    rm -rf /var/lib/apt/lists/*

# Ensure the extensions directory exists and seed it with Tok's Deforum (for any supporting assets).
RUN mkdir -p extensions && \
    if [ ! -d extensions/sd-forge-deforum ]; then \
      git clone --depth=1 https://github.com/Tok/sd-forge-deforum.git extensions/sd-forge-deforum; \
    fi

# Overlay the Deforumation-patched Deforum build and point it at the mediator.
COPY deforumation/Deforum_Version/sd-forge/sd-forge-deforum-websocket/sd-forge-deforum.7z /tmp/sd-forge-deforum.7z
RUN set -eux; \
    rm -rf extensions/sd-forge-deforum; \
    7z x /tmp/sd-forge-deforum.7z -oextensions; \
    echo "${DEFORUM_MEDIATOR_URL}" > extensions/sd-forge-deforum/scripts/deforum_helpers/deforum_mediator.cfg; \
    rm /tmp/sd-forge-deforum.7z
