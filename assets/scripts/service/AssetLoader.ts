export class AssetLoader {
    public static loadAsset(assetPath: string): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            cc.resources.load(assetPath, cc.Prefab, (err, prefab) => {
                if (err) reject(err);
                else resolve(prefab);
            });
        });
    }
}