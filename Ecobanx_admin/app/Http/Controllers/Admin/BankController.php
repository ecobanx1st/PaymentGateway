<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\AdminBank;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;

class BankController extends Controller {

    public function __construct() {
        $this->middleware('admin');
    }

    public function index($fiat) {
        $bank = AdminBank::index($fiat);
        return view('bank.list',[
            'bank' => $bank,
            'fiat' => $fiat]);
    }

    public function addbank($fiat) {
        return view('bank.addbank',[
            'fiat' => $fiat]);
    }

    public function bankadd(Request $request) { 
        $validator = $this->validate($request, [
            'coin' => 'required',
            'company_bank' => 'required',
        ]);
        $fiat  =$request->fiat;
        $bank = AdminBank::bankadd($request);
        return redirect('admin/bank/'.$fiat)->with('status','Bank Details Added Successfully');
    }

    public function editBank($id,$fiat) {
        $bank = AdminBank::edit(Crypt::decrypt($id));
        return view('bank.edit_bank',[
            'bank' => $bank,'fiat' => $fiat]); 
    }

    public function updateBank(Request $request) {
        $bank = AdminBank::bankUpdate($request);
        return back()->with('status','Bank Details Updated Successfully');
    }

}