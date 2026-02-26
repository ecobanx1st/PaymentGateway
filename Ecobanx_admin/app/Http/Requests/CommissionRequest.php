<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;

class CommissionRequest extends FormRequest
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

         Validator::extend('max_amount', function($attribute, $value)
        {   

            if($value >= Input::get('minamount'))
            {
                return true;
            }
            else
            {
                return false;
            }
        });

        return [
            'limit' => 'required|regex:/^[0-9. -]+$/',
            'minamount' => 'required|regex:/^[0-9. -]+$/',
            'maxamount' => 'required|regex:/^[0-9. -]+$/|max_amount',
            'withdraw' => 'required|regex:/^[0-9. -]+$/',
            'type' => 'required',
            'coinname' => 'required',
            'pointvalue' => 'required|regex:/^[0-9. -]+$/',
            'netfee' => 'required|regex:/^[0-9. -]+$/',
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
            'limit.required' => 'Limit is required',
            'minamount.required' => 'Minmum amount is required',
            'maxamount.required' => 'Maxmam amount is required',
            'maxamount.max_amount' => 'Must be greater than value of minmum value',
            'withdraw.required' => 'Withdraw commission is required',
            'type.required' => 'Type is required',
            'coinname.required' => 'Coinname is required',
            'pointvalue.required' => 'Pointvalue is required',
            'netfee.required' => 'Netfee is required',
        ];
    }
}
