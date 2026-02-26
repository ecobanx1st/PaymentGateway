<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;

class CoincommissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

         

        return [
           'symbol' => 'required',
            'withdraw' => 'required|regex:/^[0-9. -]+$/',
            'type' => 'required',
            'contractaddress' => 'required_if:type,==,token',
            'abiarray' => 'required_if:type,==,token',
            'coinname' => 'required',
            'status' => 'required',
            'netfee' => 'required|regex:/^[0-9. -]+$/',
            'digit' => 'required|regex:/^[0-9. -]+$/',
            'decimal_value' => 'required|regex:/^[0-9. -]+$/',
            'min_amount' => 'required|regex:/^[0-9. -]+$/',
            'max_amount' => 'required|regex:/^[0-9. -]+$/',
            'image' => 'nullable | mimes:png,Png,PNG | max:1024',
            'limit' => 'required|regex:/^[0-9. -]+$/',
        ];
    }
     /**
     * Get the validation messages that apply to the request.
     *
     * @return array
     */
    public function messages()
    {
        
        return [
            'symbol.required' => 'Symbol is required',
            'withdraw.required' => 'Withdraw is required',
            'buy.required' => 'Trade buy commission is required',
            'sell.required' => 'Trade sell commission is required',
            'type.required' => 'Type is required',
            'contractaddress.required' => 'Contract Address is required',
            'abiarray.required' => 'Abi Array is required',
            'coinname.required' => 'Coin Name is required',
            'netfee.required' => 'Netfee is required',
            'digit.required' => 'Digits is required',
            'min_amount.required' => 'Minimum amount is required',
            'max_amount.required' => 'Maximum amount is required',
            'limit.required' => 'Limit is required',
            'image.dimensions' => 'Image must be dimission of 128 X 128',
        ];
    }
}
