import { Composition, Folder } from "remotion";
import { MesaSerenaAd01 } from "./MesaSerenaAd01";

export const RemotionRoot = () => {
  return (
    <Folder name="Meta-Ads">
      <Composition
        id="MesaSerenaAd01"
        component={MesaSerenaAd01}
        durationInFrames={690}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          priceText: "5 USD",
          ctaText: "Quiero mi recetario",
          deliveryText: "Tu recetario llega directo a tu correo",
        }}
      />
    </Folder>
  );
};
