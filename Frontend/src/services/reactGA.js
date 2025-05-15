import {ReactGAImplementation} from 'react-ga4'

class ReactGA extends ReactGAImplementation {}

let myReactGA = new ReactGA()
if(document.location.hostname === 'k-stats.com'){
myReactGA.initialize('G-DEMWYKX4RK')
}
export default myReactGA