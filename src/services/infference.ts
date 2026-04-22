
// const [inferenceResult, setInferenceResult] = useState<{
//     label: 'Potential Dysgraphia' | 'Low Potential Dysgraphia';
//     confidence?: number;
//     findings: string[];
//     disclaimer?: string;
//   } | null>(null);

import Infference from "../pages/infference/Infference";

interface inferenceResult{
    label:string,
    confidence:number,
    findings:string[],
    disclaimer:string

}

export const RunInfference = (state:string)=>{

    let result:inferenceResult = {
        label: "",
        confidence: 0,
        findings: [],
        disclaimer: ""
    };

    if(state === "Low Potential Dysgraphia"){
        result.label = "Low Potential Dysgraphia";
    }else{
        result.label = "Potential Dysgraphia"
    }

    return result;
   
}