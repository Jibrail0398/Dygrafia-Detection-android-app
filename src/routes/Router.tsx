import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router";
import { IonRouterOutlet } from "@ionic/react";
import Home from "../pages/home/Home";
import Infference from "../pages/infference/Infference";


const Router:React.FC = ()=>{
    return(

        <IonReactRouter>
            <IonRouterOutlet>
                {/* Home (BASE ROOT) */}
                <Route path="/home" component={Home} exact />
                
                {/* Infference Page  */}
                <Route path="/infference" component={Infference} exact />
                
                {/* Redirect to home */}
                <Redirect exact from="/" to="/home" />
            </IonRouterOutlet>
        </IonReactRouter>

    )
}

export default Router;
