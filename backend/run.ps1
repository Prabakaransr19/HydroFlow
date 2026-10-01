$env:DB_URL="jdbc:postgresql://localhost:5432/water_management"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="0000"
$env:JWT_SECRET="hydroflow-super-secret-jwt-key-change-in-prod-32chars"
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="prabakaransr198@gmail.com"
$env:MAIL_PASSWORD="xjrl ehnc ctoq oxey"
$env:MAIL_SMTP_AUTH="true"
$env:MAIL_SMTP_STARTTLS="true"
$env:RAZORPAY_KEY_ID="rzp_test_TUnTL2efsqf4dM"
$env:RAZORPAY_KEY_SECRET="Gxpf5RKqVA3t6pzE5buMtDSX"

./mvnw spring-boot:run