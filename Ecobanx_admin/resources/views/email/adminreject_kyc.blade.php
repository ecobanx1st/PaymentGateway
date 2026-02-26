@include('email.header')
<tr><td colspan='3' align='center' height='20' style='padding:0px;'></td></tr>
<tr><td align='left'>&nbsp;</td><td style='text-align:left;font-size: 15px;color:#000;'>Dear {{ $user->name }},</td><td align='left'>&nbsp;</td></tr>
<tr><td align='left'>&nbsp;</td><td style='text-align:left;font-size: 15px;color:#000;'>Your KYC Rejected .Please Login and fill your kyc form again</td><td align='left'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='1' style='padding:0px;'></td></tr>
@include('email.footer')
