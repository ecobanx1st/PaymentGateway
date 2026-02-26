@php
$atitle ="merchanthistroy";
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
<section class="content">
	<header class="content__title">
		<h1>View Merchant Details</h1>
	</header>
	<div class="row">
		<div class="col-md-12">
			<a href="{{ url('admin/merchant-histroy') }}"><i class="zmdi zmdi-arrow-left"></i>Back to Merchant</a>
					<br />
					<br />


    	<div class="card">
				<div class="card-body">
						
						<h5>MERCHANT DETAILS:</h5></br>
						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Username : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									@if(isset($histroys->UserInfo['name']))
									<p>{{ $histroys->UserInfo['name'] != NULL ? $histroys->UserInfo['name'] : '-' }}</p>
									@else
									<p>-</p>
									@endif
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>E-mail : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									@if(isset($histroys->UserInfo['email']))
									<p>{{ $histroys->UserInfo['email'] != NULL ? $histroys->UserInfo['email'] : '-' }}</p>
									@else
									<p>-</p>
									@endif
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Merchant ID : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->UserMerchant['merchant_id'] != NULL ? $histroys->UserMerchant['merchant_id'] : '-' }}</p>
								</div>
							</div>
						
						</div>


				</div>
			</div>

			<div class="card">
				<div class="card-body">
						
						<h5>INVOICE DETAILS:</h5></br>
						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Transaction ID : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->txn_id != NULL ? $histroys->txn_id : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Payment Address : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->payment_address != NULL ? $histroys->payment_address : '-' }}</p>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Currency1/Coin1 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->currency1 != NULL ? $histroys->currency1 : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Currency2/Coin2 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->currency2 != NULL ? $histroys->currency2 : '-' }}</p>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Amount1 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->amount1 != NULL ? $histroys->amount1 : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Sathosi Amount : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->amount2 != NULL ? $histroys->amount2 : '-' }}</p>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Subtotal : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->subtotal != NULL ? $histroys->subtotal : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Shipping : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->shipping != '' ? $histroys->shipping : '-' }}</p>
								</div>
							</div>
						</div>


						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Tax : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->tax != NULL ? $histroys->tax : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Fee : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->fee != '' ? $histroys->fee : '-' }}</p>
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Net : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->net != NULL ? $histroys->net : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Item Amount : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->item_amount != '' ? $histroys->item_amount : '-' }}</p>
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Item Name : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->item_name != NULL ? $histroys->item_name : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Item Desc : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->item_desc != '' ? $histroys->item_desc : '-' }}</p>
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Ipn Url : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ipn_url != NULL ? $histroys->ipn_url : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Quantity : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->quantity != '' ? $histroys->quantity : '-' }}</p>
								</div>
							</div>
						</div>


							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Item Number : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->item_number != NULL ? $histroys->item_number : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Invoice : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->invoice != '' ? $histroys->invoice : '-' }}</p>
								</div>
							</div>
						</div>

						
							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Custom : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->custom != NULL ? $histroys->custom : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>On1 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->on1 != '' ? $histroys->on1 : '-' }}</p>
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Ov1 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ov1 != NULL ? $histroys->ov1 : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>On2 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->on2 != '' ? $histroys->on2 : '-' }}</p>
								</div>
							</div>
						</div>


							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Ov2 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ov2 != NULL ? $histroys->ov2 : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Extra : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->extra != '' ? $histroys->extra : '-' }}</p>
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Received Amount : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->received_amount != NULL ? $histroys->received_amount : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Received Confirms : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->received_confirms != '' ? $histroys->received_confirms : '-' }}</p>
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Order Count : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->order_count != NULL ? $histroys->order_count : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Secret : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->secret != '' ? $histroys->secret : '-' }}</p>
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Status : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->status_text != NULL ? $histroys->status_text : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Button Type : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
			                        @if($histroys->cmd == '_pos')
			                        <p>POS Button</p>
			                        @elseif($histroys->cmd == '_cart_add')
			                        <p>Shop Cart Button</p>
			                        @elseif($histroys->cmd == '_donation')
			                        <p>Donation Button</p>
			                        @elseif($histroys->cmd == '_pay_simple')
			                        <p>Simple  Button</p>
			                        @elseif($histroys->cmd == '_pay_advanced')
			                        <p>Advanced  Button</p>
			                        @else
			                        <p>Advanced Button</p>
			                        @endif
								</div>
							</div>
						
						</div>
				</div>
			</div>
		</div>
	</div>
	
	@if(isset($histroys->BuyerInfo['first_name']))
    <div class="card">
    <div class="card-body">
        <h5 class="">BUYER DETAILS</h5></br>
        <div class="row">
			<div class="col-md-2">
				<div class="form-group">
					<label>First Name : </label>
				</div>
			</div>
			<div class="col-md-4">
				<div class="form-group">
					@if(isset($histroys->BuyerInfo['first_name']))
					<p>{{ $histroys->BuyerInfo['first_name'] != NULL ? $histroys->BuyerInfo['first_name'] : '' }}</p>
					@else
					<p>-</p>
					@endif
				</div>
			</div>
			<div class="col-md-2">
				<div class="form-group">
					<label>Last Name : </label>
				</div>
			</div>
			<div class="col-md-4">
				<div class="form-group">
					@if(isset($histroys->BuyerInfo['last_name']))
					<p>{{ $histroys->BuyerInfo['last_name'] != NULL ? $histroys->BuyerInfo['last_name'] : '' }}</p>
					@else
					<p>-</p>
					@endif
				</div>
			</div>
			<div class="col-md-2">
				<div class="form-group">
					<label>Email : </label>
				</div>
			</div>
			<div class="col-md-4">
				<div class="form-group">
					@if(isset($histroys->BuyerInfo['email']))
					<p>{{ $histroys->BuyerInfo['email'] != NULL ? $histroys->BuyerInfo['email'] : '' }}</p>
					@else
					<p>-</p>
					@endif
				</div>
			</div>
		</div>
    </div>
    </div>
	@endif

    @if($histroys->shipping == 1)

    	<div class="card">
				<div class="card-body">
						
						<h5>SHIPPING DETAILS:</h5></br>
						<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Address : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ShippingInfo['address1'] != NULL ? $histroys->ShippingInfo['address1'] : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Address2 : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ShippingInfo['address2'] != NULL ? $histroys->ShippingInfo['address2'] : '-' }}</p>
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>City : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ShippingInfo['city'] != NULL ? $histroys->ShippingInfo['city'] : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>State : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ShippingInfo['state'] != NULL ? $histroys->ShippingInfo['state'] : '-' }}</p>
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Zip : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ShippingInfo['zip'] != NULL ? $histroys->ShippingInfo['zip'] : '-' }}</p>
								</div>
							</div>
							<div class="col-md-2">
								<div class="form-group">
									<label>Country : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ShippingInfo['country_name'] != NULL ? $histroys->ShippingInfo['country_name'] : '-' }}</p>
								</div>
							</div>
						</div>

							<div class="row">
							<div class="col-md-2">
								<div class="form-group">
									<label>Phone : </label>
								</div>
							</div>
							<div class="col-md-4">
								<div class="form-group">
									<p>{{ $histroys->ShippingInfo['phone'] != NULL ? $histroys->ShippingInfo['phone'] : '-' }}</p>
								</div>
							</div>
						
						</div>

				</div>
			</div>
  
    @endif
@endsection

<style>
	label {
    font-weight: 700;
    font-size: 14px;
    color: #003366;
}
</style>