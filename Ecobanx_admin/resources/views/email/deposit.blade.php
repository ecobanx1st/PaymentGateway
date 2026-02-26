@include('email.header')

<tr><td align='left'>&nbsp;</td><td style='text-align:left;font-size: 15px;color:#000;'>Hi {{ $details['user'] }},</td><td align='left'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='1' style='padding:0px;'></td></tr>
@if($details['status'] == 'Accept')
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Your {{ $details['amount'] }} {{ $details['coin'] }} Deposit Request has been approved by admin . Kindly login your {{ config('app.name') }} account and check {{ $details['coin'] }} deposit history </td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
@else
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Your {{ $details['amount'] }} {{ $details['coin'] }} Deposit Request has been cancelled by admin . Kindly login your {{ config('app.name') }} account and check {{ $details['coin'] }} deposit history </td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
@endif
<tr><td colspan='3' align='center' height='30' style='padding:0px;'></td></tr>


@include('email.footer')

