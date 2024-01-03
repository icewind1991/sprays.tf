prev: final: {
  spraystf-node-modules = (final.callPackage ./modules.nix {nodejs = final.nodejs_20;}).nodeDependencies;
  spraystf = final.callPackage ./package.nix {};
}
