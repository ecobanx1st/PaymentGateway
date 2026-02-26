<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeveragesRequest extends FormRequest
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
            'title' => 'required',
            'value' => 'required|regex:/^[0-9. -]+$/',
            'commission' => 'required|regex:/^[0-9. -]+$/'
        ];
    }
     /**
     * Get the validation messages that apply to the request.
     *
     * @return array
     */
    public function message()
    {
        
        return [
            'title.required' => 'Title commission is required',
            'value.required' => 'Value commission is required',
            'commission.required' => 'Commission is required'
        ];
    }
}
