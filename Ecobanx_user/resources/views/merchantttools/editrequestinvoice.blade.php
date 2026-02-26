@include('inc.header')
<section class="pagetoptitle">
<div class="container">
<div class="page-title">
<h1 class="title fnt-ubld"><i class="fa fa-credit-card" aria-hidden="true"></i>REQUEST PAYMENT INVOICE</h1>
</div>
</div>
</section>
<div class="page-container container-fluid">
<section id="main-content">
<div class="wrapper main-wrapper">      
<div class="col-md-6 col-sm-10 col-xs-11 center-content">
@if(session()->has('success'))
<div class="alert alert-success" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session()->get('success') }}
</div>
@endif
@if(session()->has('error'))
<div class="alert alert-danger" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Failed!</strong> {{ session()->get('error') }}
</div>
@endif
<section class="box has-border-left-3">
<div class="content-body contb">
<header class="panel_header">
<h2 class="title text-uppercase">EDIT REQUEST PAYMENT INVOICE</h2>
</header>
<div class="tab-content tabv account-sett">
<div class="tab-pane fade in active" id="wallet">
<form action='{{ url("/updaterequestinvoice") }}' autocomplete="off" method='POST' enctype='multipart/form-data'>
{{ csrf_field() }}
<br>
<input name="id" type="hidden" class="form-control" value="{{ $category->id }}" required="required" />
<input name="itemid" type="hidden" class="form-control" value="{{ $subcategory->id }}" required="required" />
<div class="row">
<div class="col-md-12 col-sm-12">
<div class="form-group has-feedback">
<label class="col-xs-12 control-label">Customer <span class="red-t">*</span></label>
<div class="col-xs-12 inputGroupContainer">
<input type="text" name="customername" value="{{ $category->customername }}" class="form-control" required="required" onkeyup="if (/[^0-9a-zA-Z ]/g.test(this.value)) this.value = this.value.replace(/[^0-9a-zA-Z ]/g,'')">
@if ($errors->has('customername'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('customername') }}</strong>
</span>
@endif
</div>
</div>
</div>

<div class="col-md-12 col-sm-12">
<div class="form-group has-feedback">
<label class="col-xs-12 control-label">Business Name <span class="red-t">*</span></label>
<div class="col-xs-12 inputGroupContainer">
<textarea name="companydetails" class="form-control" required="required">{!! $category->companydetails !!}</textarea>
@if ($errors->has('companydetails'))
<span class="help-block">
<strong>{{ $errors->first('companydetails') }}</strong>
</span>
@endif  
</div>
</div>
</div>

<div class="col-md-12 col-sm-12">
<div class="form-group has-feedback">
<label class="col-xs-12 control-label">Coin <span class="red-t">*</span></label>
<div class="col-xs-12 inputGroupContainer">
<select name="cointwo" id="cointwo" class="form-control" required="required">
<option @if($category->cointwo == 'BTC') selected @endif value="BTC">BTC</option>
<option @if($category->cointwo == 'DASH') selected @endif value="DASH">DASH</option>
</select>
@if ($errors->has('cointwo'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('cointwo') }}</strong>
</span>
@endif 
</div>
</div>
</div>

<div class="col-md-12 col-sm-12">
<div class="form-group has-feedback">
<label class="col-xs-12 control-label">Goods<span class="red-t">*</span></label>
<div class="col-xs-12 inputGroupContainer">
<textarea name="itemname" class="form-control" required="required">{!! $subcategory->itemname !!}</textarea>
@if ($errors->has('itemname'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('itemname') }}</strong>
</span>
@endif
</div>
</div>
</div>

<div class="col-md-12 col-sm-12">
<div class="form-group has-feedback">
<label class="col-xs-12 control-label">Amount<span class="red-t">*</span></label>
<div class="col-xs-12 inputGroupContainer">
<input type="text" name="payment_checkamt" id="payment_checkamt" class="form-control" value="{{ $category->payment_checkamt }}" required="required" onkeyup="if (/[^0-9.]/g.test(this.value)) this.value = this.value.replace(/[^0-9.]/g,'')">
@if ($errors->has('payment_checkamt'))
<span class="help-block">
<strong class="text text-danger">{{ $errors->first('payment_checkamt') }}</strong>
</span>
@endif
</div>
</div>
</div>

</div>
<div class="row">
<div class="col-md-12 text-center form-group">
<button type="submit" class="btn_ac dpst-btn text-uppercase">Save</button>
</div>
</div>
</form>
</div>
</div>
</div>
</section>
</div>
<div class="center-btn text-center">
<br>
<a href="{{ url('view-request-invoice') }}" class="btn btn-warning"><i class="fa fa-arrow-left"></i> Back to Request Invoice</a><br />
</div>
</div>
</section>
</div>
@include('inc.footer')