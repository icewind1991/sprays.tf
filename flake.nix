{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "nixpkgs/release-23.05";
  };

  outputs = {
    self,
    nixpkgs,
    utils,
  }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = (import nixpkgs) {
        inherit system;
      };
      nodeDependencies = (pkgs.callPackage ./default.nix { nodejs = pkgs.nodejs_20; }).nodeDependencies;
    in rec {
      # `nix develop`
      devShell = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [nodejs_20 node2nix];
      };

      packages.spraystf = pkgs.stdenv.mkDerivation rec {
        name = "sprays.tf";
        version = "0.1.0";

        src = ./.;

        buildInputs = with pkgs; [nodejs_20];
        buildPhase = ''
          ln -s ${nodeDependencies}/lib/node_modules ./node_modules
          export PATH="${nodeDependencies}/bin:$PATH"

          ${nodeDependencies}/bin/grunt
        '';

        installPhase = ''
          mkdir -p $out
          cp index.html $out/
          cp -r build $out/
        '';
      };
      defaultPackage = packages.spraystf;
    });
}
