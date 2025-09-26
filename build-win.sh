#!/bin/bash
docker build -t tsi-gym-agent-builder .
docker run --rm -ti \
  -v ${PWD}:/project \
  -v ${PWD##*/}-node-modules:/project/node_modules \
  tsi-gym-agent-builder
