import {sqrt, erf, sign, abs, exp } from 'mathjs'
export function cdf(z:number){
    return (1.0 + erf(z / sqrt(2.0))) / 2.0
}

export function laplace_cdf(z:number){
    return 0.5 * (1 + sign(z) * (1 - exp( -abs(z) * sqrt(2))))
}