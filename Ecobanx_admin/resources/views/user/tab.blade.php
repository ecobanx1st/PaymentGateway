<div class="tab-container">                 
	<ul class="nav nav-tabs" role="tablist">
		<li class="nav-item">
			<a class="nav-link @if($title=='users_edit') active @endif" href="{{ url('/admin/users_edit/'.Crypt::encrypt($userdetails->id)) }}" role="tab">User Details</a>
		</li>
<!-- <li class="nav-item">
<a class="nav-link" @if($title=='basic_profile') active @endif href="{{ url('/admin/basic_profile/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Basic Profile</a>
</li> -->
<li class="nav-item">
	<a class="nav-link @if($title=='merchant_details') active @endif" href="{{ url('/admin/merchant_details/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Merchant Setting</a>
</li>
<li class="nav-item">
	<a class="nav-link @if($title=='usercommissionsetting') active @endif" href="{{ url('/admin/usercommissionsetting/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Commissions</a>
</li>
<li class="nav-item">
	<a class="nav-link @if($title=='userApi') active @endif" href="{{ url('/admin/userApi/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Api</a>
</li>
<li class="nav-item">
	<a class="nav-link @if($title=='users_wallet') active @endif" href="{{ url('/admin/users_wallet/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Wallet</a>
</li>										
<li class="nav-item">
	<a class="nav-link @if($title=='userdeposit') active @endif" href="{{ url('/admin/userdeposit/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Coin Deposit</a>
</li>
<!-- <li class="nav-item">
	<a class="nav-link @if($title=='userfiatdeposit') active @endif" href="{{ url('/admin/userfiatdeposit/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Fiat Deposit</a>
</li> -->
<li class="nav-item">
	<a class="nav-link @if($title=='user_withdraw') active @endif" href="{{ url('/admin/user_withdraw/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Coin Withdraw</a>
</li>
<!-- <li class="nav-item">
	<a class="nav-link @if($title=='user_fiat_withdraw') active @endif" href="{{ url('/admin/user_fiat_withdraw/'.Crypt::encrypt($userdetails->id)) }}" role="tab">Fiat Withdraw</a>
</li> -->

<li class="nav-item">
	<a class="nav-link @if($title=='overall') active @endif"  href="{{ url('/admin/overalltransaction/'.Crypt::encrypt($userdetails->id)).'/all' }}" role="tab">Overall Transaction</a>
</li>
</ul>
</br>
</div>
