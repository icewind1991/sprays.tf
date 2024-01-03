{
  stdenv,
  nodejs_20,
  spraystf-node-modules,
  lib,
}: let
  src = lib.sources.sourceByRegex (lib.cleanSource ./.) [".*.html" "(src|style)(/.*)?" "package.*" "Gruntfile.js"];
in
  stdenv.mkDerivation rec {
    name = "sprays.tf";
    version = "0.1.0";

    inherit src;

    nativeBuildInputs = [nodejs_20];
    buildPhase = ''
      ln -s ${spraystf-node-modules}/lib/node_modules ./node_modules
      export PATH="${spraystf-node-modules}/bin:$PATH"

      ${spraystf-node-modules}/bin/grunt
    '';

    installPhase = ''
      mkdir -p $out
      cp index.html $out/
      cp -r build $out/
    '';
  }
