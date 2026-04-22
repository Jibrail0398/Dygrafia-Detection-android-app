import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import Home from "../pages/home/Home";
import Infference from "../pages/infference/Infference";
import BottomNavbar from "../components/BottomNavbar";


const Router:React.FC = ()=>{
    return(

        <IonReactRouter>
            <IonRouterOutlet>
                {/* Infference Page - must come before default */}
                <Route path="/infference" component={Infference} exact />
                
                {/* Home (BASE ROOT) */}
                <Route path="/" component={Home} exact />
                
               
               
            </IonRouterOutlet>

            <BottomNavbar/>
            
        </IonReactRouter>

    )
}

export default Router;
