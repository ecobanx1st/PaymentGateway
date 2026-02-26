@php $title = "API Keys"; $atitle ="APIKEY";
@endphp
@include('layouts.headercss')
<style type="text/css">
	.panelcontentbox {
	    background: #fff;
	    position: relative;
	    border-radius: 7px;
	    overflow: hidden;
	}
	.heading-box {
		padding: 20px 20px;
		margin: 0px;
		background: #ffffff;
		border-bottom: 1px solid #e7e7e7;
		color: #041f5c;
		font-size: 18px;
		text-transform: capitalize;
		border-radius: 0;
		font-weight: 600;
		font-family: "ClashDisplay-Bold, sans-serif";
	}
	.contentbox {
    padding: 25px 20px;
	height: 84%;
}
.text-muted{
	    font-size: 12px !important;
    color: #284E7E !important;
    font-weight: 600;
    margin-top: 5px;
    display: inline-block;
}
h5.frm-subtext.text-center.pb-20 {
    font-size: 15px;
}
</style>
<section class="Dashboard-page">
	<div class="container-fluid">
		<div class="row">

			@include('layouts.menu')


			<div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

				<div class="header-part-outer">

					<div class="head-title-part">
						<h1>API Keys</h1>
					</div>

				</div>
				@if ($message =Session::get('success'))
		      <div class="snackbar show" role="alert"><i class="fa fa-check-circle text-success"></i> {{ $message }}</div>
		    @endif
		    @if ($message = Session::get('error'))
		      <div class="snackbar show" role="alert"><i class="fa fa-times-circle text-danger"></i>{{ $message }}</div>
		    @endif

				<div class="dashboard-body history-body">

					<div class="row">


						<div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
							<div class="panelcontentbox">
          <div class="heading-box">Update API Keys</div>
                              <div class="contentbox">
							<div class="form-container">
							<form action='{{ url("/api-setting") }}' method='POST'>

								{{ csrf_field() }}
								<h5 class="frm-subtext text-center pb-20">This page will let you customize what functions this API key can access. For maximum security leave all commands disabled unless you are using them.</h5>
								<div class="row">
									<div class="col-md-12">
										<div class="form-group">
											<label class="form-label">Key Name (optional)</label>
											<div class="controls">
												<input type="hidden" class="form-control" name="apiid" value="{{ \Hashids::encode($apiset->api_id) }}">
												<input type="text" class="form-control" name="keyname" value="{{ isset($apiset->key_name) ? $apiset->key_name :'' }}">
												@if ($errors->has('keyname'))
												<span class="help-block">
												<strong class="text text-danger">{{ $errors->first('keyname') }}</strong>
												</span>
												@endif
												<p class="text-muted">The key name is just for your reference in case you have multiple keys to help remind you what you used it for.</p>
											</div>
										</div>
									</div>
									<div class="col-md-12">
										<div class="form-group">
											<label class="form-label">Restrict to IP/IP Range</label>
											<div class="controls">
												<input type="text" class="form-control" name="ip" value="{{ isset($apiset->api_ip) ? $apiset->api_ip :'' }}">
												@if ($errors->has('ip'))
												<span class="help-block">
												<strong class="text text-danger">{{ $errors->first('ip') }}</strong>
												</span>
												@endif
												<p class="text-muted">Allowed formats: single IP xxx.xxx.xxx.xxx or CIDR range xxx.xxx.xxx.xxx/yyy<br>You can have multiple entries separated with an enter. <br>For example: 127.0.0.1<br>127.0.0.2</p>
											</div>
										</div>
									</div>
								</div>
								
						
								<div align="center">
									<div class="form-group Update-Settings merchant-settings-btns">
										<a class="btn lightgreen mt-20" href="{{ url('/empty-api-setting/'.\Hashids::encode($apiset->api_id)) }}">Nevermind</a>
										<button type="submit" class="btn orangebg mt-20">Update Permissions</button>
									</div>
								</div>
							</form>
						</div>
						</div>
						</div>

						</div>



						<div class="col-lg-6 col-xl-6 col-md-6 col-sm-12 col-xs-12">
							<div class="panelcontentbox">
          <div class="heading-box">API Key Permissions</div>
                              <div class="contentbox">
							<div class="form-container">
						<form action='{{ url("/api-setting-permission") }}' method='POST'>
								{{ csrf_field() }}
				<section class="box has-border-left-3">
					<div class="content-body contb">
						<div class="table-responsive site-scroll" data-simplebar>
							<table class="table table-small-font no-mb table-borderded">
								<thead>
									<tr>
										<th>Command</th>
										<th>Allow Access</th>										
									</tr>
								</thead>
								<tbody>

									<tr>
										<td>Basicinfo</td>

										<input type="hidden" class="form-control" name="apiid" value="{{ \Hashids::encode($apiset->api_id) }}">										
										<td><label class="checkcont"><input type="checkbox" name="basicinfo" value="1" <?php echo (isset($apiset->basicinfo) && $apiset->basicinfo ==1 ? 'checked' : '');?>/> <span class="checkmark"></span></label></td>
									</tr>

									<tr>
										<td>Get Balance</td>
									
										<td><label class="checkcont"><input type="checkbox" name="balance" value="1" <?php echo (isset($apiset->balance) && $apiset->balance ==1 ? 'checked' : '');?>/> <span class="checkmark"></span></label></td>
									</tr>

									<tr>
										<td>Convert Coins</td>
										
										<td><label class="checkcont"><input type="checkbox" name="convert_coins" value="1" <?php echo (isset($apiset->convert_coins) && $apiset->convert_coins ==1 ? 'checked' : '');?>/> <span class="checkmark"></span></label></td>
									</tr>

									<tr>
										<td>Deposit</td>
										
										<td><label class="checkcont"><input type="checkbox" name="deposit" value="1" <?php echo (isset($apiset->deposit) && $apiset->deposit ==1 ? 'checked' : '');?>/> <span class="checkmark"></span></label></td>
									</tr>


									<tr>
										<td>Get Transaction	</td>										
										<td><label class="checkcont"><input type="checkbox" name="transaction" value="1" <?php echo (isset($apiset->transaction) && $apiset->transaction ==1 ? 'checked' : '');?>/> <span class="checkmark"></span></label></td>
									</tr>
									<tr>
										<td>Get Deposit History</td>										
										<td><label class="checkcont"><input type="checkbox" name="deposit_history" value="1" <?php echo (isset($apiset->deposit_history) && $apiset->deposit_history ==1 ? 'checked' : '');?> /> <span class="checkmark"></span></label></td>
									</tr>
									<tr>
										<td>Get Withdraw History</td>										
										<td><label class="checkcont"><input type="checkbox" name="withdraw_history" value="1" <?php echo (isset($apiset->withdraw_history) && $apiset->withdraw_history ==1 ? 'checked' : '');?>/> <span class="checkmark"></span></label></td>
									</tr>
									<tr>
										<td>Withdraw</td>										
										<td><label class="checkcont"><input type="checkbox" name="withdraw" value="1" <?php echo (isset($apiset->withdraw) && $apiset->withdraw ==1 ? 'checked' : '');?>/> <span class="checkmark"></span></label></td>
									</tr>
									
								</tbody>
							</table>
						</div>
						<div align="center">
							<div class="form-group Update-Settings merchant-settings-btns">
								<a class="btn lightgreen mt-20" href="{{ url('/empty-api-permission/'.\Hashids::encode($apiset->api_id)) }}">Nevermind</a>

								<button type="submit" class="btn orangebg mt-20">Update Permissions</button>
							</div>
						</div>
					</div>					
				</section>
			</form>		

						</div>
						</div>
						</div>
						</div>


					</div>

				</div>

			</div>

		</div>
	</div>
</section>





</body>
</html>
