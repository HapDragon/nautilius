/**
 * Created by wqy
 * Date 2022/11/29 14:21
 * Description
 */
import * as Cesium from 'cesium/Build/Cesium';


export function CreateGlowMaterial(colormiddle,colorside,repeat) {
    return new Cesium.Material({
        fabric: {
            uniforms: {
                colormiddle: colormiddle||new Cesium.Cartesian3(0.94,0.94,0.99),
                colorside: colorside||new Cesium.Cartesian3(30.0*1.2/255.,144.0*1.2/255.,255.0*1.2/255.),
                repeatX:repeat||500
            },
            source: `
            uniform vec3 colormiddle;
            uniform vec3 colorside;
            uniform float repeatX;
            varying float v_polylineAngle;
		mat2 rotate(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat2(
        c, s,
        -s, c
    );
}
              czm_material czm_getMaterial(czm_materialInput materialInput){
			czm_material material = czm_getDefaultMaterial(materialInput);
			vec2 st = materialInput.st;		
			vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;	
			//50 is the length in pixels
			float dashPosition = fract(pos.x / (50.0 * czm_pixelRatio));
			float step=smoothstep(0.0,0.6,abs(st.t-0.5)*2.0);
			material.alpha = (1.0-abs(st.t-0.5)*2.0)*0.7;
			if(material.alpha>0.56)
			material.alpha*=1.58;
			//use pixel
			st.s=dashPosition;
			float sflag=fract(st.s-fract(czm_frameNumber*0.01));
			if(sflag>0.75)
			material.alpha=0.0;
			//use st.s
			// float sflag=sin(st.s*repeatX-czm_frameNumber*0.06);			
			// if(sflag>0.91)			
			// material.alpha=0.0;
			material.diffuse = mix(colormiddle,colorside,step);
			return material;
		}
              `
        }
    });
}

export function CreateFlowMaterial(options) {
    if(options.image==undefined) return ;
    return new Cesium.Material({
        fabric: {
            uniforms: {
                color: options.color||new Cesium.Color(220/255, 20/255, 60/255, 1.5),
                image: options.image,
                speed: options.speed||20,
                repeatX: options.repeatX||1,
                repeatY: options.repeatY||1,
            },
            source: `
            	uniform sampler2D image;
		uniform vec4 color;
		uniform float speed;
		uniform float repeatX;
		uniform float repeatY;
		
		varying float v_polylineAngle;
		mat2 rotate(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat2(
        c, s,
        -s, c
    );
}
		czm_material czm_getMaterial(czm_materialInput materialInput){
			czm_material material = czm_getDefaultMaterial(materialInput);
			float t = clamp(fract(czm_frameNumber * speed / 1000.0),0.0,1.0);
			vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;
			float dashPosition = fract(pos.x / (30.0 * czm_pixelRatio));
			vec2 st = materialInput.st;
			// st=gl_FragCoord.xy;
			// st.s = st.s*repeatX;
			st.t = st.t*repeatY;
			st = fract(st);
			st.s=dashPosition;
			vec4 colorImage = texture2D(image, vec2(fract(st.s - t), st.t));
			material.alpha = colorImage.a * color.a;
			material.diffuse = color.rgb;
			return material;
		}
              `
        }
    });
}

export function CreateFlowWithTextMaterial(options) {
    if(options.image==undefined) return ;
    if(options.textimage==undefined) return ;
    if(options.textlength==undefined) return ;

    return new Cesium.Material({
        fabric: {
            uniforms: {
                color: options.color||new Cesium.Color(220/255, 20/255, 60/255, 1.5),
                image: options.image,
                textimage:options.textimage,
                textbili:options.textbili||0.5,
                speed: options.speed||20,
                repeatX: options.repeatX||1,
                repeatY: options.repeatY||1,
                textlength:options.textlength,
                textyflip:options.textyflip||false,
                needflipdir:options.needflipdir||false
            },
            source: `
            	uniform sampler2D image;
            	uniform sampler2D textimage;
		uniform vec4 color;
		uniform float speed;
		uniform float repeatX;
		uniform float repeatY;
		uniform float textbili;
		uniform float textlength;
		uniform bool textyflip;
		uniform bool needflipdir;
		varying float v_polylineAngle;
		mat2 rotate(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat2(
        c, s,
        -s, c
    );
}
		czm_material czm_getMaterial(czm_materialInput materialInput){
			czm_material material = czm_getDefaultMaterial(materialInput);
			float t = clamp(fract(czm_frameNumber * speed / 1000.0),0.0,1.0);
			vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;
			float flipdir=1.;
			if(needflipdir==true)
			
			flipdir=mod(czm_frameNumber,1000.0)>500.0?-1.:1.;
			
			float dashPosition = fract((pos.x*flipdir) / (30.0 * czm_pixelRatio));
			vec2 st = materialInput.st;
			
			
			st.t=((st.t-0.5)/textbili)+0.5;
			bool showtext=abs(st.t-0.5)>=(1.0-textbili);
			if(showtext==true)
			{
			    t =clamp(fract(czm_frameNumber * speed / 10000.0),0.0,1.0);	
			   
			    dashPosition = fract(((textyflip==true||flipdir==-1.?(-pos.x):(pos.x))) / (textlength * czm_pixelRatio))-t;
			   
			
			    float y=materialInput.st.t;
			    // vec4 textcolor=texture2D(textimage, vec2(dashPosition , y));
			    if(y>0.5)
			    {
			       y=y-0.5-0.5*(1.0-textbili);			
			    }			
			    
			    y=y*repeatY/textbili;
			    // vec4 textcolor=texture2D(textimage, vec2(fract(dashPosition) , y));
			    vec4 textcolor=texture2D(textimage, vec2(fract(dashPosition) , textyflip==true||flipdir==-1.?y:(1.0-y)));
			    material.diffuse=textcolor.rgb;
		        material.alpha=textcolor.a;			
			}
			else{
			    st.t = st.t*repeatY;
			    st = fract(st);
			    st.s=dashPosition;
			    vec4 colorImage = texture2D(image, vec2(fract(st.s - t), st.t));
			    material.alpha = colorImage.a * color.a;
			    material.diffuse = color.rgb;
			}
			
			
			return material;
		}
              `
        }
    });
}

export function CreateCircleWaveMaterial() {
    return new Cesium.Material({
        fabric:{
            uniforms:{
                // color: Cesium.Color.fromCssColorString('#67ADDF'),
                color:Cesium.Color.RED ,
                speed: 8.0,
                count: 4,
                gradient: 0.6
            },
            source:`
             uniform vec4 color;
                                          uniform float speed;
                                          uniform float count;
                                          uniform float gradient;

                                          czm_material czm_getMaterial(czm_materialInput materialInput)
                                          {
                                          czm_material material = czm_getDefaultMaterial(materialInput);
                                          material.diffuse = 1.5 * color.rgb;
                                          vec2 st = materialInput.st;
                                          float dis = distance(st, vec2(0.5, 0.5));
                                          float per = fract(czm_frameNumber * speed / 1000.0);
                                          if(count == 1.0){
                                              if(dis > per * 0.5){
                                              discard;
                                              }else {
                                              material.alpha = color.a  * dis / per / 2.0;
                                              }
                                          } else {
                                              vec3 str = materialInput.str;
                                              if(abs(str.z)  > 0.001){
                                              discard;
                                              }
                                              if(dis > 0.5){
                                              discard;
                                              } else {
                                              float perDis = 0.5 / count;
                                              float disNum;
                                              float bl = 0.0;
                                              for(int i = 0; i <= 999; i++){
                                                  if(float(i) <= count){
                                                  disNum = perDis * float(i) - dis + per / count;
                                                  if(disNum > 0.0){
                                                      if(disNum < perDis){
                                                      bl = 1.0 - disNum / perDis;
                                                      }
                                                      else if(disNum - perDis < perDis){
                                                      bl = 1.0 - abs(1.0 - disNum / perDis);
                                                      }
                                                      material.alpha = pow(bl,(1.0 + 10.0 * (1.0 - gradient)));
                                                  }
                                                  }
                                              }
                                              }
                                          }
                                          return material;
                                          }
            `
        }
    })
}