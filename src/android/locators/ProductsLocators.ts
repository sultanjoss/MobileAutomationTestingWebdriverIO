
/**
 * Android - Swag Labs Products Locators
 */

export const ProductsLocators = {

    productTitle:
        'android=new UiSelector().text("PRODUCTS")',

    backpackName:
        'android=new UiSelector().text("Sauce Labs Backpack")',

    addToCartButton:
        'android=new UiSelector().text("ADD TO CART").instance(0)',

    cartButton:
        'android=new UiSelector().className("android.widget.ImageView").instance(3)'

} as const;
