export { default as useColorScheme } from './hooks/useColorScheme';
export { default as Navigation } from './navigation';
export { default as Config } from './navigation/Config';
export { default as useScreenModule } from './hooks/useScreenModule'
import _ from 'lodash';

(function(l) {  // for github-page
    if (l !== undefined && l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, '',
            l.pathname.slice(0, -1) + decoded + l.hash
        );
    }
}(window.location))
    
const ignoreWarnings = ['ReactNativeFiberHostComponent'];
const _console = _.clone(console);
console.warn = (message: string|Object) => {
    var warn = true;
    if (message instanceof Object)
    warn = false;
    else{
    ignoreWarnings.forEach((value)=>{
        if (message.indexOf && message.indexOf(value) <= -1) {
            warn = false;
        }
    })
    };
    if (warn){
        _console.warn(message);
    }
    else{
        // console.log(message)
    }
};
