import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'discount'
})

export class DiscountPipe implements PipeTransform {

    transform(price: number, discount: number = 0): any {
        if (!price) return price;

        // get discount from percent and get new price minus discount
        price = +price - ((+price * +discount) / 100);

        return +(price.toFixed(2));
    };

};