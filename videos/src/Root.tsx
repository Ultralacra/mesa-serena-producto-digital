import { Composition, Folder, Still } from "remotion";
import { Ad01Arepa, Ad02Mercado, Ad03Familia, Ad04Producto, Ad05Semaforo } from "./Ads";
import { MesaSerenaAd01 } from "./MesaSerenaAd01";

export const RemotionRoot = () => {
  return (
    <Folder name="Meta-Ads">
      <Composition
        id="MesaSerenaAd01"
        component={MesaSerenaAd01}
        durationInFrames={504}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          priceText: "5 USD",
          ctaText: "Quiero mi recetario",
          deliveryText: "Tu recetario llega directo a tu correo",
        }}
      />
      <Folder name="Meta-Ads-Imagenes">
        <Still id="Ad01Arepa" component={Ad01Arepa} width={1080} height={1350} />
        <Still id="Ad02Mercado" component={Ad02Mercado} width={1080} height={1350} />
        <Still id="Ad03Familia" component={Ad03Familia} width={1080} height={1350} />
        <Still id="Ad04Producto" component={Ad04Producto} width={1080} height={1350} />
        <Still id="Ad05Semaforo" component={Ad05Semaforo} width={1080} height={1350} />
      </Folder>
    </Folder>
  );
};
