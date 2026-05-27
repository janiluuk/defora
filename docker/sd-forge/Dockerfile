FROM pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime

ARG DEFORUM_MEDIATOR_URL=ws://host.docker.internal:8765
ENV DEFORUM_MEDIATOR_URL=${DEFORUM_MEDIATOR_URL}

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      git libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /stable-diffusion-webui

RUN git clone --depth=1 https://github.com/lllyasviel/stable-diffusion-webui-forge.git . && \
    git clone --depth=1 https://github.com/Tok/sd-forge-deforum.git extensions/sd-forge-deforum

# Apply Deforumation patches: mediator protocol + animation/render hooks.
COPY docker/sd-forge/deforumation-patches/ extensions/sd-forge-deforum/scripts/deforum_helpers/

RUN set -eux; \
    echo "${DEFORUM_MEDIATOR_URL}" > extensions/sd-forge-deforum/scripts/deforum_helpers/deforum_mediator.cfg
