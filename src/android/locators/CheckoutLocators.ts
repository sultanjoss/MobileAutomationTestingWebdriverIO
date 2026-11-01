
export const CheckoutLocators = {

    // Checkout Information
    informationTitle:
        'android=new UiSelector().text("CHECKOUT: INFORMATION")',

    firstNameInput:
        '~test-First Name',

    lastNameInput:
        '~test-Last Name',

    postalCodeInput:
        '~test-Zip/Postal Code',

    continueButton:
        '~test-CONTINUE',

    // Checkout Overview
    overviewTitle:
        'android=new UiSelector().text("CHECKOUT: OVERVIEW")',

    backpackName:
        'android=new UiSelector().text("Sauce Labs Backpack")',

    finishButton:
        '~test-FINISH',

    // Checkout Complete
    completeTitle:
        'android=new UiSelector().text("CHECKOUT: COMPLETE!")',

    backHomeButton:
        '~test-BACK HOME'

} as const;
