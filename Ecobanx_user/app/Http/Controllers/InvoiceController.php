<?php
	namespace App\Http\Controllers;
	
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Auth;
	use Illuminate\Support\Facades\Crypt;
	use Illuminate\Support\Str;
	use Illuminate\Support\Facades\Redirect;
	use Illuminate\Support\Facades\Input;
	use Illuminate\Support\Facades\File;
	use Illuminate\Support\Facades\URL;
	use DB;
	use Session;
	use Mail;
	use Validator;
	use Carbon\Carbon;
	use App\Libraries\BinanceClass;

	use App\User;
	use App\Models\OrderTransaction;

	class InvoiceController extends Controller
	{		
		public function __construct()
		{
        	$this->middleware(['auth','twofa','kyc']);
			//$this->middleware(['auth','twofa']);			
		}
	

		public function InvoiceView($id)
		{ 
		//$id =\Hashids::decode($id);
		if(empty($id)){
            return back()->with('warning', 'something went wrong');
		}
		$history = OrderTransaction::where('id',$id)->first();
		if($history){
			$uid = Auth::id();
			$user = User::where('id',$uid)->first();
    		return view('userpanel.invoice.invoice',['trans' => $history,'user' => $user]);
    	}else{
            return back()->with('warning', 'something went wrong');
    	}
    	}
		
}	